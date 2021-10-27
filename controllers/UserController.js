const db = require("../models");
const profileUtils = require("../utils/profile");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");
const Sequelize = require("sequelize");
const smtpService = require("../services/smtp.service");
const moment = require("moment-timezone");
const TimeZoneList = require("../enum/TimeZoneList");
const { readExcelFile, progressLog } = require("../utils/excel");
const { USER_ROLE, EmailContent } = require("../enum");
const bcryptService = require("../services/bcrypt.service");
const { getEventPeriod, convertToUTCTime } = require("../utils/format");
const omit = require("lodash/omit");
const { AWSConfig } = require("../enum");
const FroalaEditor = require("wysiwyg-editor-node-sdk/lib/froalaEditor");
const { isEmpty } = require("lodash");

const { Op, QueryTypes } = Sequelize;
const User = db.User;
const Event = db.Event;
const AnnualConference = db.AnnualConference;

const UserController = () => {
  const getUser = async (req, res) => {
    const { id } = req.token;

    if (id) {
      try {
        const user = await User.findOne({
          where: {
            id,
          },
        });

        if (!user) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Bad Request: User not found" });
        }

        return res.status(HttpCodes.OK).json({ user });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: user id is wrong" });
    }
  };

  const updateUser = async (req, res) => {
    let user = req.body;
    const { id } = req.token;

    if (user) {
      try {
        const prevUser = await User.findOne({
          where: {
            id,
          },
        });
        if (!prevUser) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: data is wrong" });
        }

        // in case of email update
        if (user.email.toLowerCase() !== prevUser.email) {
          const existing = await User.findOne({
            where: {
              email: user.email.toLowerCase(),
            },
          });

          if (existing) {
            return res
              .status(HttpCodes.BAD_REQUEST)
              .json({ msg: "This email was used by someone." });
          }
        }

        // in case of profile picture
        if (user.imageStr) {
          const imageUrl = await s3Service().getUserImageUrl(
            user.img,
            user.imageStr
          );
          user.img = imageUrl;
        }
        user.percentOfCompletion = profileUtils.getProfileCompletion(user);
        user.completed = user.percentOfCompletion === 100;
        user.abbrName = `${(user.firstName || "").slice(0, 1).toUpperCase()}${(
          user.lastName || ""
        )
          .slice(0, 1)
          .toUpperCase()}`;

        const [numberOfAffectedRows, affectedRows] = await User.update(
          {
            ...user,
            email: user.email.toLowerCase(),
          },
          {
            where: { id },
            returning: true,
            plain: true,
          }
        );

        return res
          .status(HttpCodes.OK)
          .json({ numberOfAffectedRows, affectedRows });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: data is wrong" });
    }
  };

  const upgradePlan = async (req, res) => {
    let data = req.body;
    const { id } = req.token;

    if (data && data.memberShip) {
      try {
        const [numberOfAffectedRows, affectedRows] = await User.update(
          { memberShip: data.memberShip },
          {
            where: { id },
            returning: true,
            plain: true,
          }
        );

        return res
          .status(HttpCodes.OK)
          .json({ numberOfAffectedRows, affectedRows });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: data is wrong" });
    }
  };

  const getEventDescription = (rawData) => {
    if (rawData) {
      if (rawData.blocks) {
        return rawData.blocks.map((item) => item.text).join(`/n`);
      }
    }
    return "";
  };

  const generateAttendEmail = async (user, event) => {
    const timezone = TimeZoneList.find((item) => item.value === event.timezone);

    const calendarInvite = event.startAndEndTimes.map((time, index) => {
      let date = moment(event.startDate).add(index, "day").format("YYYY-MM-DD");

      const startTime = moment(time.startTime).format("HH:mm:ss");
      const startDate = convertToUTCTime(
        moment(`${date} ${startTime}`),
        timezone
      );

      const endTime = moment(time.endTime).format("HH:mm:ss");
      const endDate = convertToUTCTime(moment(`${date} ${endTime}`), timezone);

      return smtpService().generateCalendarInvite(
        startDate,
        endDate,
        event.title,
        getEventDescription(event.description),
        "",
        // event.location,
        `${process.env.DOMAIN_URL}${event.id}`,
        event.organizer,
        process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
        timezone.utc[0]
      );
    });

    const mailOptions = {
      from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
      to: user.email,
      subject: `CONFIRMATION – You Are Attending: "${event.title}"`,
      html: EmailContent.EVENT_ATTEND_EMAIL(user, event, getEventPeriod),
      contentType: "text/calendar",
    };

    let icsContent = calendarInvite.map((calendar) => {
      return calendar.toString();
    });

    console.log(icsContent, "touch");

    icsContent = icsContent.map((content) => {
      content = content.replace(
        "BEGIN:VEVENT",
        `METHOD:REQUEST\r\nBEGIN:VEVENT`
      );

      return content;
    });

    if (!isEmpty(calendarInvite)) {
      mailOptions["attachments"] = calendarInvite.map((calendar, index) => {
        return {
          filename:
            event.startAndEndTimes.length > 1
              ? `Day-${index + 1}-invite.ics`
              : "invite.ics",
          content: icsContent[index],
          contentType: "application/ics; charset=UTF-8; method=REQUEST",
          contentDisposition: "inline",
        };
      });
    }

    let sentResult = null;
    try {
      sentResult = await smtpService().sendMail(mailOptions);
    } catch (err) {
      console.log(err);
    }

    return sentResult;
  };

  const addEvent = async (req, res) => {
    let event = req.body;
    const { id } = req.token;
    const { user: prevUser } = req;

    try {
      const [rows, user] = await User.update(
        {
          events: Sequelize.fn(
            "array_append",
            Sequelize.col("events"),
            event.id
          ),
          attended: {
            ...prevUser.attended,
            [event.id]: moment().format(),
          },
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );

      // update users and status field from Events model
      const prevEvent = await Event.findOne({ where: { id: event.id } });
      const [numberOfAffectedRows, affectedRows] = await Event.update(
        {
          users: Sequelize.fn("array_append", Sequelize.col("users"), id),
          status: { ...prevEvent.status, [id]: "going" },
        },
        {
          where: { id: event.id },
          returning: true,
          plain: true,
        }
      );

      generateAttendEmail(user, affectedRows);

      return res
        .status(HttpCodes.OK)
        .json({ numberOfAffectedRows, affectedRows });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const removeEvent = async (req, res) => {
    let event = req.body;
    const { id } = req.token;

    try {
      const prevUser = await User.findOne({
        where: { id },
      });
      await User.update(
        {
          events: Sequelize.fn(
            "array_remove",
            Sequelize.col("events"),
            event.id
          ),
          attended: omit(prevUser.attended, event.id),
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );

      const prevEvent = await Event.findOne({ where: { id: event.id } });
      const [numberOfAffectedRows, affectedRows] = await Event.update(
        {
          users: Sequelize.fn("array_remove", Sequelize.col("users"), id),
          status: omit(prevEvent.status, id),
        },
        {
          where: { id: event.id },
          returning: true,
          plain: true,
        }
      );

      return res
        .status(HttpCodes.OK)
        .json({ numberOfAffectedRows, affectedRows });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getMyEvents = async (req, res) => {
    const { id } = req.token;

    try {
      let query = `
        SELECT public."Events".*
        FROM public."Events" JOIN public."Users" ON public."Events".id = ANY (public."Users".events) 
        WHERE public."Users".id = ${id} AND public."Events".level = 0 ORDER BY "startDate";
      `;
      const results = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      return res.status(HttpCodes.OK).json({
        myEvents: results.map((item) => ({
          ...item,
          credit: null,
        })),
      });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const importUsers = async (fileName, startDate, endDate) => {
    const users = readExcelFile(fileName);

    try {
      for (let index = 0; index < users.length; index++) {
        const username = users[index].first_name
          ? users[index].first_name.split(" ")
          : [""];
        let userInfo = {
          email: users[index].email.toLowerCase(),
          password: bcryptService().password("12345678"),
          firstName: username[0],
          lastName: username.length > 1 ? username[1] : "",
          role: USER_ROLE.USER,
          subscription_startdate: startDate,
          subscription_enddate: endDate,
          external_payment: 1,
          memberShip: "premium",
        };

        userInfo.percentOfCompletion =
          profileUtils.getProfileCompletion(userInfo);
        userInfo.completed = userInfo.percentOfCompletion === 100;
        userInfo.abbrName = `${(userInfo.firstName || "")
          .slice(0, 1)
          .toUpperCase()}${(userInfo.lastName || "")
          .slice(0, 1)
          .toUpperCase()}`;

        await User.create(userInfo);

        progressLog(`${index + 1} / ${users.length} created.`);
      }

      console.log("Done.");
    } catch (error) {
      console.log(error);
    }
  };

  const getAll = async (req, res) => {
    try {
      const users = await User.findAll();

      if (!users) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Bad Request: Users not found" });
      }

      return res.status(HttpCodes.OK).json({ users });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * This function generate and send invitation email
   * @param {*} req
   * @param {*} res
   * @returns
   */
  const generateInvitationEmail = async (req, res) => {
    const { user } = req;
    let { email } = req.body;
    try {
      email = email.split(",");

      let listPromises = [];

      email.map((item) => {
        const mailOptions = {
          from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
          to: item.trim(),
          subject: `${user.firstName} thought you’d like to join the best platform for HR pros`,
          html: EmailContent.INVITE_EMAIL(user),
          contentType: "text/html",
        };
        listPromises.push(smtpService().sendMail(mailOptions));
      });

      await Promise.all(listPromises);

      return res.status(HttpCodes.OK).send();
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const searchUser = async (req, res) => {
    const { search, limit } = req;

    try {
      const users = await User.findAll({
        where: search
          ? {
              [Op.or]: [
                {
                  firstName: {
                    [Op.iLike]: `%${search}%`,
                  },
                },
                {
                  lastName: {
                    [Op.iLike]: `%${search}%`,
                  },
                },
              ],
            }
          : {},
        limit: limit || 50,
      });

      return res.status(HttpCodes.OK).json({ users });
    } catch (error) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const setAttendedToConference = async (req, res) => {
    const { user } = req;

    try {
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          attendedToConference: 1,
        },
        {
          where: { id: user.id },
          returning: true,
          plain: true,
        }
      );

      return res.status(HttpCodes.OK).json({ user: affectedRows });
    } catch (error) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const addSession = async (req, res) => {
    const { user } = req;
    const { id } = req.params;

    try {
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          sessions: Sequelize.fn("array_append", Sequelize.col("sessions"), id),
        },
        {
          where: { id: user.id },
          returning: true,
          plain: true,
        }
      );

      return res.status(HttpCodes.OK).json({ user: affectedRows });
    } catch (error) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const removeSession = async (req, res) => {
    const { user } = req;
    const { id } = req.params;

    try {
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          sessions: Sequelize.fn("array_remove", Sequelize.col("sessions"), id),
        },
        {
          where: { id: user.id },
          returning: true,
          plain: true,
        }
      );

      return res.status(HttpCodes.OK).json({ user: affectedRows });
    } catch (error) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getSessionUsers = async (req, res) => {
    try {
      const users = await User.findAll({
        where: {
          attendedToConference: 1,
        },
      });

      return res.status(HttpCodes.OK).json({ users });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const removeSessionUser = async (req, res) => {
    const { id } = req.params;

    try {
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          attendedToConference: 0,
          sessions: [],
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );

      return res
        .status(HttpCodes.OK)
        .json({ numberOfAffectedRows, affectedRows });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const uploadResume = async (req, res, next) => {
    const { user } = req;

    try {
      const { resume } = req.files || {};

      if (resume) {
        const uploadRes = await s3Service().uploadResume(resume, user);
        const [rows, updatedUser] = await User.update(
          {
            resumeFileName: resume.name,
            resumeUrl: uploadRes.Location,
          },
          {
            where: { id: user.id },
            returning: true,
            plain: true,
          }
        );
        res.status(HttpCodes.OK).json({ user: updatedUser });
      }

      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "File not found!" });
    } catch (error) {
      next(error);
    }
  };

  const deleteResume = async (req, res, next) => {
    const { user } = req;

    try {
      if (user.resumeFileName) {
        await s3Service().deleteResume(user.resumeUrl);
        const [rows, updatedUser] = await User.update(
          {
            resumeFileName: "",
            resumeUrl: "",
          },
          {
            where: { id: user.id },
            returning: true,
            plain: true,
          }
        );
        res.status(HttpCodes.OK).json({ user: updatedUser });
      }

      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "File not found!" });
    } catch (error) {
      next(error);
    }
  };

  const getEditorSignature = async (req, res) => {
    const EditorConfig = {
      bucket: AWSConfig.S3.EDITOR_BUCKET_NAME,
      region: "us-east-2",
      keyStart: "editor/",
      acl: "public-read",
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secretKey: process.env.AWS_SECRET_ACCESS_KEY,
    };

    const s3Hash = FroalaEditor.S3.getHash(EditorConfig);

    return res.status(HttpCodes.OK).json({ s3Hash });
  };

  return {
    getUser,
    updateUser,
    searchUser,
    upgradePlan,
    addEvent,
    removeEvent,
    getMyEvents,
    importUsers,
    getAll,
    generateInvitationEmail,
    setAttendedToConference,
    addSession,
    removeSession,
    getSessionUsers,
    removeSessionUser,
    uploadResume,
    deleteResume,
    getEditorSignature,
  };
};

module.exports = UserController;
