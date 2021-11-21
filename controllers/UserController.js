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
const { getEventPeriod } = require("../utils/format");
const omit = require("lodash/omit");
const { AWSConfig } = require("../enum");
const FroalaEditor = require("wysiwyg-editor-node-sdk/lib/froalaEditor");
const { isEmpty } = require("lodash");
const { LabEmails } = require("../enum");
const { googleCalendar, yahooCalendar } = require("../utils/generateCalendars");
const { sequelize } = require("../models");

const { Op, QueryTypes } = Sequelize;
const User = db.User;
const Event = db.Event;
const AnnualConference = db.AnnualConference;
const Bonfire = db.Bonfire;

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

  const generateAttendEmail = async (user, tz, event) => {
    const userTimezone = TimeZoneList.find((item) => item.utc.includes(tz));
    const timezone = TimeZoneList.find((item) => item.value === event.timezone);

    const calendarInvite = event.startAndEndTimes.map((time, index) => {
      let startTime = moment.tz(time.startTime, userTimezone.utc[0]);
      let endTime = moment.tz(time.endTime, userTimezone.utc[0]);

      console.log(startTime, endTime);
      return smtpService().generateCalendarInvite(
        startTime,
        endTime,
        event.title,
        getEventDescription(event.description),
        "",
        // event.location,
        `${process.env.DOMAIN_URL}${event.id}`,
        event.organizer,
        process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
        userTimezone.utc[0]
      );
    });

    const mailOptions = {
      from: process.env.SEND_IN_BLUE_SMTP_SENDER,
      to: user.email,
      subject: `CONFIRMATION – You Are Attending: "${event.title}"`,
      html: EmailContent.EVENT_ATTEND_EMAIL(user, event, getEventPeriod),
      contentType: "text/calendar",
    };

    let icsContent = calendarInvite.map((calendar) => {
      return calendar.toString();
    });

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
      sentResult = await smtpService().sendMailUsingSendInBlue(mailOptions);
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

      generateAttendEmail(user, event.userTimezone, affectedRows);

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
          attendedToConference: user.attendedToConference === 0 ? 1 : 0,
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
      const query = `
      SELECT public."AnnualConferences"."startTime" FROM public."Users" 
      LEFT JOIN public."AnnualConferences" ON public."AnnualConferences".id = ANY (public."Users".sessions::int[]) 
      WHERE public."Users"."id" = ${user.id}
    `;

      const userSessions = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      const sessionToSchedule = await AnnualConference.findOne({
        where: { id },
        attributes: ["startTime"],
      });

      const { dataValues: userToJoin } = await User.findOne({
        where: { id: user.id },
      });

      for (const session of userSessions) {
        if (session.startTime === sessionToSchedule.dataValues.startTime) {
          return res.status(HttpCodes.BAD_REQUEST).json({
            msg: "You already have another session scheduled at the same time and date",
          });
        }
      }

      if (userToJoin.addedFirstSession) {
        await User.increment(
          {
            pointsConferenceLeaderboard: +20,
          },
          {
            where: { id: user.id },
          }
        );
      } else {
        await User.increment(
          {
            pointsConferenceLeaderboard: +50,
          },
          {
            where: { id: user.id },
          }
        );
      }
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          sessions: Sequelize.fn("array_append", Sequelize.col("sessions"), id),
          addedFirstSession: true,
        },
        {
          where: { id: user.id },
          returning: true,
          plain: true,
        }
      );

      return res.status(HttpCodes.OK).json({ user: affectedRows });
    } catch (error) {
      console.log(error);
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

  const addBonfire = async (req, res) => {
    const { user } = req;
    const { id } = req.params;

    try {
      const query = `
      SELECT public."Bonfires"."startTime" FROM public."Users" 
      LEFT JOIN public."Bonfires" ON public."Bonfires".id = ANY (public."Users".bonfires::int[]) 
      WHERE public."Users"."id" = ${user.id}
    `;

      const userBonfires = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      const { dataValues: bonfireToJoin } = await Bonfire.findOne({
        where: { id },
      });

      const { dataValues: bonfireCreator } = await User.findOne({
        where: {
          id: bonfireToJoin.bonfireCreator,
        },
      });

      for (const bonfire of userBonfires) {
        if (bonfire.startTime === bonfireToJoin.startTime) {
          return res.status(HttpCodes.BAD_REQUEST).json({
            msg: "You already joined another bonfire at the same time and date",
          });
        }
      }
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          bonfires: Sequelize.fn("array_append", Sequelize.col("bonfires"), id),
        },
        {
          where: { id: user.id },
          returning: true,
          plain: true,
        }
      );

      await User.increment(
        {
          pointsConferenceLeaderboard: +200,
        },
        {
          where: { id: user.id },
        }
      );

      await Promise.resolve(
        (() => {
          const timezone = TimeZoneList.find(
            (timezone) =>
              timezone.value === bonfireToJoin.timezone ||
              timezone.text === bonfireToJoin.timezone
          );

          const offset = timezone.offset;
          const targetBonfireStartDate = moment(bonfireToJoin.startTime)
            .tz(timezone.utc[0])
            .utcOffset(offset, true);

          const targetBonfireEndDate = moment(bonfireToJoin.endTime)
            .tz(timezone.utc[0])
            .utcOffset(offset, true);

          const timezoneUser = TimeZoneList.find(
            (timezone) =>
              timezone.value === affectedRows.dataValues.timezone ||
              timezone.text === affectedRows.dataValues.timezone
          );

          const googleLink = googleCalendar(bonfireToJoin, timezoneUser.utc[0]);
          const yahooLink = yahooCalendar(bonfireToJoin, timezoneUser.utc[0]);

          // const calendarInvite = generateIcsCalendar(
          //   bonfireToJoin,
          //   timezoneUser.utc[0]
          // );

          // let icsContent = calendarInvite.toString();

          let mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: affectedRows.dataValues.email,
            subject: LabEmails.BONFIRE_JOINING.subject,
            html: LabEmails.BONFIRE_JOINING.body(
              affectedRows.dataValues,
              bonfireToJoin,
              bonfireCreator,
              targetBonfireStartDate.format("MMM DD"),
              targetBonfireStartDate.format("h:mm a"),
              targetBonfireEndDate.format("h:mm a"),
              timezone.value,
              googleLink,
              yahooLink
            ),
            // contentType: "text/calendar",
            // attachments: [
            //   {
            //     filename: `${bonfireToJoin.title}-invite.ics`,
            //     content: icsContent,
            //     contentType: "application/ics; charset=UTF-8; method=REQUEST",
            //     contentDisposition: "inline",
            //   },
            // ],
          };
          console.log("***** mailOptions ", mailOptions);

          return smtpService().sendMailUsingSendInBlue(mailOptions);
        })()
      );

      return res.status(HttpCodes.OK).json({ user: affectedRows });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const removeBonfire = async (req, res) => {
    const { user } = req;
    const { id } = req.params;

    try {
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          bonfires: Sequelize.fn("array_remove", Sequelize.col("bonfires"), id),
        },
        {
          where: { id: user.id },
          returning: true,
          plain: true,
        }
      );

      await Bonfire.update(
        {
          uninvitedJoinedUsers: Sequelize.fn(
            "array_remove",
            Sequelize.col("uninvitedJoinedUsers"),
            affectedRows.dataValues.id
          ),
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );

      return res.status(HttpCodes.OK).json({ user: affectedRows });
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

  const createInvitation = async (req, res) => {
    const { email, username } = req.body;

    try {
      const userAlreadyRegistered = await User.findOne({
        where: {
          email,
        },
      });

      if (userAlreadyRegistered) {
        return res
          .status(HttpCodes.CONFLICT)
          .json({ msg: "this user has already been registered" });
      }
      const link = `${process.env.DOMAIN_URL}invitation/${username}/${email}`;

      const user = await User.increment(
        {
          pointsConferenceLeaderboard: +100,
        },
        {
          where: { username },
          returning: true,
        }
      );

      await Promise.resolve(
        (() => {
          let mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: email,
            subject: LabEmails.INVITATION_TO_JOIN.subject(user[0][0][0]),
            html: LabEmails.INVITATION_TO_JOIN.body(link),
          };

          console.log("***** mailOptions ", mailOptions);

          return smtpService().sendMailUsingSendInBlue(mailOptions);
        })()
      );

      return res.status(HttpCodes.OK).json({ msg: `User invited succesfully` });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const acceptInvitationJoin = async (req, res) => {
    const { hostUser } = req.query;

    try {
      const { dataValues: user } = await User.findOne({
        where: { username: hostUser },
      });

      if (!user) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Host user not found" });
      }

      await User.increment(
        {
          pointsConferenceLeaderboard: +500,
        },
        {
          where: { username: hostUser },
        }
      );

      return res.status(HttpCodes.OK).json({ msg: `Thanks for joining` });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const confirmAccessibilityRequirements = async (req, res) => {
    const { id } = req.params;

    try {
      const { dataValues: user } = await User.findOne({
        where: {
          id,
        },
      });

      if (!user) {
        return res.status(HttpCodes.BAD_REQUEST).json({
          msg: "user not found",
        });
      }

      await Promise.resolve(
        (() => {
          let mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: "enrique@hackinghr.io",
            subject: LabEmails.USER_CONFIRM_ACCESSIBILITY_REQUIREMENTS.subject,
            html: LabEmails.USER_CONFIRM_ACCESSIBILITY_REQUIREMENTS.body(user),
          };
          console.log("***** mailOptions ", mailOptions);

          return smtpService().sendMailUsingSendInBlue(mailOptions);
        })()
      );

      return res
        .status(HttpCodes.OK)
        .json({ msg: "We received your request and will be in touch shortly" });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
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
    addBonfire,
    removeBonfire,
    uploadResume,
    deleteResume,
    getEditorSignature,
    createInvitation,
    acceptInvitationJoin,
    confirmAccessibilityRequirements,
  };
};

module.exports = UserController;
