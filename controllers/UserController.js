const db = require("../models");
const profileUtils = require("../utils/profile");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");
const Sequelize = require("sequelize");
const smtpService = require("../services/smtp.service");
const moment = require("moment");
const TimeZoneList = require("../enum/TimeZoneList");
const { readExcelFile, progressLog } = require("../utils/excel");
const { USER_ROLE, EmailContent } = require("../enum");
const bcryptService = require("../services/bcrypt.service");
const { getEventPeriod } = require("../utils/format");
const omit = require("lodash/omit");

const QueryTypes = Sequelize.QueryTypes;
const User = db.User;
const Event = db.Event;

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

        const [numberOfAffectedRows, affectedRows] = await User.update(user, {
          where: { id },
          returning: true,
          plain: true,
        });

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
    return rawData ? rawData.blocks.map((item) => item.text).join(`/n`) : "";
  };

  const generateAttendEmail = async (user, event) => {
    const smtpTransort = {
      service: "gmail",
      auth: {
        user: process.env.FEEDBACK_EMAIL_CONFIG_USER,
        pass: process.env.FEEDBACK_EMAIL_CONFIG_PASSWORD,
      },
    };

    const startDate = moment(event.startDate, "YYYY-MM-DD h:mm a");
    const endDate = moment(event.endDate, "YYYY-MM-DD h:mm a");
    const timezone = TimeZoneList.find((item) => item.value === event.timezone);

    const calendarInvite = smtpService().generateCalendarInvite(
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

    const mailOptions = {
      from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
      to: user.email,
      subject: `CONFIRMATION – You Are Attending: "${event.title}"`,
      html: EmailContent.EVENT_ATTEND_EMAIL(user, event, getEventPeriod),
      contentType: 'text/calendar',
    };
    
    let icsContent = calendarInvite.toString();
    icsContent = icsContent.replace('BEGIN:VEVENT', `METHOD:REQUEST\r\nBEGIN:VEVENT`)

    if (calendarInvite) {
      mailOptions["attachments"] = [
        {
          filename: "invite.ics",
          content: icsContent,
          contentType: "application/ics; charset=UTF-8; method=REQUEST",
          contentDisposition: "inline",
        },
      ];
    }

    console.log("**** mailOptions ", mailOptions);
    let sentResult = null;
    try {
      sentResult = await smtpService().sendMail(smtpTransort, mailOptions);
    } catch (err) {
      console.log(err);
    }

    return sentResult;
  };

  const addEvent = async (req, res) => {
    let event = req.body;
    const { id } = req.token;

    try {
      const prevUser = await User.findOne({
        where: { id },
      });
      const [rows, user] = await User.update(
        {
          events: Sequelize.fn(
            "array_append",
            Sequelize.col("events"),
            event.id
          ),
          attended: { ...prevUser.attended, [event.id]: moment().format() },
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
        WHERE public."Users".id = ${id} ORDER BY "startDate";
      `;
      const results = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      return res.status(HttpCodes.OK).json({ myEvents: results });
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

        userInfo.percentOfCompletion = profileUtils.getProfileCompletion(
          userInfo
        );
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

      email = email.split(',')

      const smtpTransort = {
        service: "gmail",
        auth: {
          user: process.env.FEEDBACK_EMAIL_CONFIG_USER,
          pass: process.env.FEEDBACK_EMAIL_CONFIG_PASSWORD,
        },
      };
      
      let listPromises = [];

      email.map((item) => {
        const mailOptions = {
          from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
          to: item.trim(),
          subject: `${user.firstName} thought you’d like to join the best platform for HR pros`,
          html: EmailContent.INVITE_EMAIL(user),
          contentType: 'text/html',
        };
        listPromises.push(smtpService().sendMail(smtpTransort, mailOptions));
      });

      await Promise.all(listPromises);
      
      return res
              .status(HttpCodes.OK)
              .send();
    } catch (err) {
      console.log(err);
      return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
    }
  };

  return {
    getUser,
    updateUser,
    upgradePlan,
    addEvent,
    removeEvent,
    getMyEvents,
    importUsers,
    getAll,
    generateInvitationEmail,
  };
};

module.exports = UserController;
