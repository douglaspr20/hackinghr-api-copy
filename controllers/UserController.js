const db = require("../models");
const profileUtils = require("../utils/profile");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");
const Sequelize = require("sequelize");
const smtpService = require("../services/smtp.service");
const moment = require("moment");

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
        if (user.email !== prevUser.email) {
          const existing = await User.findOne({
            where: {
              email: user.email,
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

  const generateAttendEmail = async (user, event) => {
    const smtpTransort = {
      service: "gmail",
      auth: {
        user: process.env.FEEDBACK_EMAIL_CONFIG_USER,
        pass: process.env.FEEDBACK_EMAIL_CONFIG_PASSWORD,
      },
    };

    const startDate = moment(event.startDate, "YYYY-MM-DD hh:mm a");
    const endDate = moment(event.endDate, "YYYY-MM-DD hh:mm a");

    const calendarInvite = smtpService().generateCalendarInvite(
      startDate,
      endDate,
      event.title,
      event.description,
      event.location,
      `${process.env.DOMAIN_URL}/public-event/${event.id}`,
      "Name",
      process.env.FEEDBACK_EMAIL_CONFIG_RECEIVER
    );

    const startDate = moment(event.startDate);

    const mailOptions = {
      from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
      to: user.email,
      subject: `CONFIRMATION – You Are Attending: "${event.title}"`,
      html: `
        Hi, ${user.firstName}
        <br/>
        <strongThank you for registering for ${event.title}!
        <br/>
        We look forward to seeing you on ${startDate.format(
          "MMM DD"
        )} at ${startDate.format("h:mm")}. 
        <br/>
        We are sending the calendar invite attached. Please add it in your calendar. 
        <br/>
        Please remember to go back to the Hacking HR LAB the day after the event and certify that you attended. If you are a PREMIUM MEMBER you will be able to claim your digital certificate of participation and (if applicable) HR recertification credits. 
        <br />
        Thank you! 
        <br />
        Hacking HR Team
        <br/>
      `,
    };

    if (calendarInvite) {
      let alternatives = {
        "Content-Type": "text/calendar",
        method: "REQUEST",
        content: new Buffer(calendarInvite.toString()),
        component: "VEVENT",
        "Content-Class": "urn:content-classes:calendarmessage",
      };
      mailOptions["alternatives"] = alternatives;
      mailOptions["alternatives"]["contentType"] = "text/calendar";
      mailOptions["alternatives"]["content"] = new Buffer(
        calendarInvite.toString()
      );
    }

    console.log("**** mailOptions ", mailOptions);

    const sentResult = await smtpService().sendMail(smtpTransort, mailOptions);

    return sentResult;
  };

  const addEvent = async (req, res) => {
    let event = req.body;
    const { id } = req.token;

    try {
      const [rows, user] = await User.update(
        {
          events: Sequelize.fn(
            "array_append",
            Sequelize.col("events"),
            event.id
          ),
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );

      // update users and status field from Events model
      const [numberOfAffectedRows, affectedRows] = await Event.update(
        {
          users: Sequelize.fn("array_append", Sequelize.col("users"), id),
          [`status.${id}`]: "going",
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
      await User.update(
        {
          events: Sequelize.fn(
            "array_remove",
            Sequelize.col("events"),
            event.id
          ),
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );

      const [numberOfAffectedRows, affectedRows] = await Event.update(
        {
          users: Sequelize.fn("array_remove", Sequelize.col("users"), id),
          [`status.${id}`]: null,
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

  return {
    getUser,
    updateUser,
    upgradePlan,
    addEvent,
    removeEvent,
    getMyEvents,
  };
};

module.exports = UserController;
