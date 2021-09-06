const db = require("../models");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");
const { isValidURL } = require("../utils/profile");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const moment = require("moment-timezone");
const { LabEmails } = require("../enum");
const smtpService = require("../services/smtp.service");
const cronService = require("../services/cron.service");
const cryptoService = require("../services/crypto.service");
const TimeZoneList = require("../enum/TimeZoneList");
const { Settings, EmailContent, USER_ROLE } = require("../enum");
const isEmpty = require("lodash/isEmpty");
const { convertToLocalTime, convertJSONToExcel } = require("../utils/format");
const NotificationController = require("../controllers/NotificationController");

const Event = db.Event;
const User = db.User;
const QueryTypes = Sequelize.QueryTypes;
const VisibleLevel = Settings.VISIBLE_LEVEL;

const EventController = () => {
  const setEventReminders = (event) => {
    const dateBefore24Hours = convertToLocalTime(event.startDate).subtract(
      1,
      "days"
    );
    const interval1 = `0 ${dateBefore24Hours.minutes()} ${dateBefore24Hours.hours()} ${dateBefore24Hours.date()} ${dateBefore24Hours.month()} *`;
    const dateBefore2Hours = convertToLocalTime(event.startDate).subtract(
      45,
      "minutes"
    );
    const interval2 = `0 ${dateBefore2Hours.minutes()} ${dateBefore2Hours.hours()} ${dateBefore2Hours.date()} ${dateBefore2Hours.month()} *`;

    console.log("////////////////////////////////////////////");
    console.log("/////// setEventReminders //////");
    if (dateBefore24Hours.isAfter(moment())) {
      cronService().addTask(`${event.id}-24`, interval1, true, async () => {
        let targetEvent = await Event.findOne({ where: { id: event.id } });
        targetEvent = targetEvent.toJSON();
        const eventUsers = await Promise.all(
          (targetEvent.users || []).map((user) => {
            return User.findOne({
              where: {
                id: user,
              },
            });
          })
        );

        await Promise.all(
          eventUsers.map((user) => {
            const _user = user.toJSON();
            const targetEventDate = moment(targetEvent.startDate);
            let mailOptions = {
              from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
              to: _user.email,
              subject: LabEmails.EVENT_REMINDER_24_HOURS.subject(targetEvent),
              html: LabEmails.EVENT_REMINDER_24_HOURS.body(
                _user,
                targetEvent,
                targetEventDate.format("MMM DD"),
                targetEventDate.format("h:mm a")
              ),
            };

            console.log("***** mailOptions ", mailOptions);

            return smtpService().sendMail(mailOptions);
          })
        );
      });
    }

    if (dateBefore2Hours.isAfter(moment())) {
      cronService().addTask(`${event.id}-45`, interval2, true, async () => {
        let targetEvent = await Event.findOne({ where: { id: event.id } });
        targetEvent = targetEvent.toJSON();
        const eventUsers = await Promise.all(
          (targetEvent.users || []).map((user) => {
            return User.findOne({
              where: {
                id: user,
              },
            });
          })
        );

        await Promise.all(
          eventUsers.map((user) => {
            const _user = user.toJSON();
            let mailOptions = {
              from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
              to: _user.email,
              subject: LabEmails.EVENT_REMINDER_45_MINUTES.subject(targetEvent),
              html: LabEmails.EVENT_REMINDER_45_MINUTES.body(
                _user,
                targetEvent
              ),
            };

            console.log("***** mailOptions ", mailOptions);
            return smtpService().sendMail(mailOptions);
          })
        );
      });
    }
  };

  const removeEventReminders = (event) => {
    cronService().stopTask(`${event.id}-24`);
    cronService().stopTask(`${event.id}-45`);
  };

  const removeOrganizerReminders = (event) => {
    Array.from(Array(5).keys()).forEach((index) => {
      cronService().stopTask(`${event.id}-participant-list-reminder-${index}`);
    });
  };

  const sendParticipantsListToOrganizer = async (event) => {
    console.log("***************************");
    console.log("************** send email to organizer *************");
    console.log("***** event = ", event);
    let targetEvent = await Event.findOne({ where: { id: event.id } });
    targetEvent = targetEvent.toJSON();
    console.log("***** targetEvent = ", targetEvent);
    const eventUsers = await Promise.all(
      (targetEvent.users || []).map((user) => {
        return User.findOne({
          where: {
            id: user,
          },
        });
      })
    );
    console.log("***** eventUsers = ", eventUsers);
    const buffer = await convertJSONToExcel(
      event.title,
      [
        {
          label: "First Name",
          value: "firstName",
          width: 20,
        },
        {
          label: "Last Name",
          value: "lastName",
          width: 20,
        },
        {
          label: "Email",
          value: "email",
          width: 20,
        },
      ],
      eventUsers.map((user) => user.toJSON())
    );

    let mailOptions = {
      from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
      to: event.organizerEmail,
      subject: LabEmails.PARTICIPANTS_LIST_TO_ORGANIZER.subject(),
      attachments: [
        {
          filename: `${event.title}.xls`,
          content: buffer,
        },
      ],
    };
    console.log("******* start sending email ******");
    console.log("***** mailOptions = ", mailOptions);
    await smtpService().sendMail(mailOptions);
    console.log("******* end sending email ******");
  };

  const setOrganizerReminders = (event) => {
    const dates = [
      convertToLocalTime(event.startDate).subtract(1, "week"),
      convertToLocalTime(event.startDate).subtract(3, "days"),
      convertToLocalTime(event.startDate).subtract(2, "days"),
      convertToLocalTime(event.startDate).subtract(1, "days"),
      convertToLocalTime(event.startDate).subtract(2, "hours"),
      convertToLocalTime(event.startDate).subtract(30, "minutes"),
    ];
    console.log("/////////////////////////////////////////////////////");
    console.log("//////// setOrganizerReminders ///////");
    dates.forEach((date, index) => {
      const interval = `10 ${date.minutes()} ${date.hours()} ${date.date()} ${date.month()} *`;
      console.log("******** email interval ", interval);
      if (date.isAfter(moment())) {
        console.log("****** adding task");
        cronService().addTask(
          `${event.id}-participant-list-reminder-${index}`,
          interval,
          true,
          () => sendParticipantsListToOrganizer(event)
        );
      }
    });
  };

  const sendMessage = async (users, subject, message) => {
    let mailOptions = {
      from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
      subject,
      html: message,
    };

    await Promise.all(
      users.map((user) => {
        mailOptions = {
          ...mailOptions,
          to: user.email,
        };

        return smtpService().sendMail(mailOptions);
      })
    );
  };

  const create = async (req, res) => {
    const { body } = req;

    if (body.title) {
      try {
        let eventInfo = {
          ...body,
        };

        if (eventInfo.image) {
          eventInfo.image = await s3Service().getEventImageUrl(
            "",
            eventInfo.image
          );
        }

        if (eventInfo.image2) {
          eventInfo.image2 = await s3Service().getEventImageUrl(
            "",
            eventInfo.image2
          );
        }

        const event = await Event.create(eventInfo);

        if (!event) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        const [numberOfAffectedRows, affectedRows] = await Event.update(
          {
            publicLink: `${process.env.DOMAIN_URL}${event.id}`,
          },
          {
            where: { id: event.id },
            returning: true,
            plain: true,
          }
        );

        setEventReminders(event);
        setOrganizerReminders(event);

        const startTime = convertToLocalTime(event.startDate);
        if (startTime.isAfter(moment())) {
          await NotificationController().createNotification({
            message: `New Event "${
              event.title || eventInfo.title
            }" was created.`,
            type: "event",
            meta: {
              ...event,
              publicLink: `${process.env.DOMAIN_URL}${event.id}`,
            },
          });
        }

        return res.status(HttpCodes.OK).json({ event: affectedRows });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error", error: err });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Title is needed." });
  };

  const updateEvent = async (req, res) => {
    const { id } = req.params;
    const event = req.body;

    try {
      let eventInfo = {
        ...event,
      };

      let prevEvent = await Event.findOne({
        where: {
          id,
        },
      });

      if (!prevEvent) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request: event not found." });
      }

      prevEvent = prevEvent.toJSON();

      if (event.image && !isValidURL(event.image)) {
        eventInfo.image = await s3Service().getEventImageUrl("", event.image);

        if (prevEvent.image) {
          await s3Service().deleteUserPicture(prevEvent.image);
        }
      }
      if (prevEvent.image && !event.image) {
        await s3Service().deleteUserPicture(prevEvent.image);
      }

      if (event.image2 && !isValidURL(event.image2)) {
        eventInfo.image2 = await s3Service().getEventImageUrl("", event.image2);

        if (prevEvent.image2) {
          await s3Service().deleteUserPicture(prevEvent.image2);
        }
      }
      if (prevEvent.image2 && !event.image2) {
        await s3Service().deleteUserPicture(prevEvent.image2);
      }

      const [numberOfAffectedRows, affectedRows] = await Event.update(
        eventInfo,
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

  const getAllEvents = async (req, res) => {
    const { role, email } = req.user;
    try {
      let where = {
        level: {
          [Op.or]: [VisibleLevel.DEFAULT, VisibleLevel.ALL],
        },
      };

      if (role === USER_ROLE.EVENT_ORGANIZER) {
        where = {
          ...where,
          organizerEmail: email,
        };
      }

      const events = await Event.findAll({
        where,
      });

      return res.status(HttpCodes.OK).json({ events });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getEvent = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        const event = await Event.findOne({
          where: {
            id,
          },
        });

        if (!event) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Bad Request: Event not found" });
        }

        return res.status(HttpCodes.OK).json({ event });
      } catch (err) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: event id is wrong" });
    }
  };

  const updateEventStatus = async (req, res) => {
    const { id: eventId } = req.params;
    const { id: userId } = req.token;
    const { status } = req.body;

    if (eventId && userId) {
      try {
        let prevEvent = await Event.findOne({ where: { id: eventId } });
        prevEvent = prevEvent.toJSON();
        const [numberOfAffectedRows, affectedRows] = await Event.update(
          {
            status: { ...prevEvent.status, [userId]: status },
          },
          {
            where: { id: eventId },
            returning: true,
            plain: true,
          }
        );

        return res
          .status(HttpCodes.OK)
          .json({ numberOfAffectedRows, affectedRows });
      } catch (error) {
        console.log(err);
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

  const sendEmailAfterEvent = async (event) => {
    try {
      let requests = event.users.map((user) => {
        return User.findOne({
          where: {
            id: user,
          },
        });
      });
      const users = await Promise.all(requests);

      let mailOptions = {
        from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
        subject: `Did you attend ${event.title}? – Get Your Digital Certificate!`,
      };

      requests = users.map((user) => {
        mailOptions.to = user.email;
        mailOptions.html = EmailContent.CLAIM_EMAIL(user, event);

        return smtpService().sendMail(mailOptions);
      });
      await Promise.all(requests);
    } catch (error) {
      console.log(error);
    }
  };

  const emailAfterEventThread = async () => {
    try {
      const currentUTCTime = moment.utc().format();
      const results = await Event.findAll({
        where: {
          [Op.and]: [
            {
              startDate: {
                [Op.lte]: currentUTCTime,
              },
            },
            {
              isOverEmailSent: {
                [Op.not]: true,
              },
            },
          ],
        },
      });

      let requests = [];
      requests = results.map((event) => {
        return sendEmailAfterEvent(event);
      });
      await Promise.all(requests);

      if (results && results.length > 0) {
        await Event.update(
          {
            isOverEmailSent: true,
          },
          {
            where: {
              id: {
                [Op.in]: results.map((event) => event.id),
              },
            },
          }
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getEventUsers = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        let query = `
          SELECT public."Events".id as eventId, public."Users".*
          FROM public."Events"
          JOIN public."Users" ON public."Users".id = ANY (public."Events".users::int[])
          WHERE public."Events".id = ${id};
        `;

        const userList = await db.sequelize.query(query, {
          type: QueryTypes.SELECT,
        });

        return res.status(HttpCodes.OK).json({ userList });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: event id is wrong" });
  };

  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        const event = await Event.findOne({
          where: { id },
        });
        const result = await Event.destroy({
          where: {
            id,
          },
        });

        // remove reminders
        removeEventReminders(event);
        removeOrganizerReminders(event);

        return res.status(HttpCodes.OK).json({});
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Event id is wrong" });
  };

  const sendTestMessage = async (req, res) => {
    const { emails, subject, message } = req.body;
    const emailList = emails.split(",").map((item) => item.trim());

    try {
      let mailOptions = {
        from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
        subject,
        html: message,
      };

      await Promise.all(
        emailList.map((email) => {
          mailOptions = {
            ...mailOptions,
            to: email,
          };

          return smtpService().sendMail(mailOptions);
        })
      );

      return res.status(HttpCodes.OK).json({});
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const sendMessageToParticipants = async (req, res) => {
    const { id } = req.params;
    const { subject, message } = req.body;

    if (id) {
      try {
        const event = await Event.findOne({
          where: { id },
        });

        const users = await Promise.all(
          (event.users || []).map((user) => {
            return User.findOne({ where: { id: user } });
          })
        );

        sendMessage(users, subject, message);

        return res.status(HttpCodes.OK).json({});
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Event id is wrong" });
  };

  const downloadICS = async (req, res) => {
    const { id } = req.params;

    try {
      const event = await Event.findOne({
        where: { id },
      });

      if (!event) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      const startDate = convertToLocalTime(
        event.startDate,
        "YYYY-MM-DD h:mm a"
      );
      const endDate = convertToLocalTime(event.endDate, "YYYY-MM-DD h:mm a");
      const localTimezone = moment.tz.guess();

      const calendarInvite = smtpService().generateCalendarInvite(
        startDate,
        endDate,
        event.title,
        "",
        "",
        // event.location,
        `${process.env.DOMAIN_URL}${event.id}`,
        event.organizer,
        process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
        localTimezone
      );

      let icsContent = calendarInvite.toString();
      icsContent = icsContent.replace(
        "BEGIN:VEVENT",
        `METHOD:REQUEST\r\nBEGIN:VEVENT`
      );

      res.setHeader("Content-Type", "application/ics; charset=UTF-8;");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${encodeURIComponent(event.title)}.ics`
      );
      res.setHeader("Content-Length", icsContent.length);
      return res.end(icsContent);
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getChannelEvents = async (req, res) => {
    const filter = req.query;

    try {
      let where = {
        channel: filter.channel,
      };

      if (filter.topics && !isEmpty(JSON.parse(filter.topics))) {
        where = {
          ...where,
          categories: {
            [Op.overlap]: JSON.parse(filter.topics),
          },
        };
      }

      const channelEvents = await Event.findAll({ where });

      return res.status(HttpCodes.OK).json({ channelEvents });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const deleteChannelEvent = async (req, res) => {
    const { channel } = req.query;
    const { id } = req.params;

    if (req.user.channel != channel) {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: You are not allowed." });
    }

    try {
      const event = await Event.findOne({
        where: { id },
      });

      await Event.destroy({
        where: { id },
      });

      // remove reminders
      removeEventReminders(event);
      removeOrganizerReminders(event);

      return res.status(HttpCodes.OK).json({});
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const resetEmailReminders = async (req, res) => {
    try {
      console.log("****** starting ******");
      let allEvents = await Event.findAll({});
      allEvents = allEvents.map((event) => event.toJSON());
      console.log("****** allEvents ******", allEvents);
      const comingEvents = allEvents.filter((event) => {
        const startTime = convertToLocalTime(event.startDate);
        return moment().isBefore(startTime);
      });
      console.log("****** comingEvents", comingEvents);
      console.log("****** at first cron tasks ", cronService().listCrons());
      cronService().stopAllTasks();
      console.log("****** before cron tasks ", cronService().listCrons());
      comingEvents.forEach((event) => {
        setEventReminders(event);
        setOrganizerReminders(event);
      });
      console.log("****** after cron tasks ", cronService().listCrons());
      return res.status(HttpCodes.OK).json({});
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const claimCredit = async (req, res) => {
    const { id, pdf } = req.body;
    const { user } = req;

    if (id) {
      try {
        let event = await Event.findOne({
          where: {
            id,
          },
          raw: true,
        });

        console.log("****** event ", event);

        if (event.showClaim === 1) {
          let mailOptions = {
            from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
            to: user.email,
            subject: LabEmails.EVENT_CLAIM_CREDIT.subject(event.title),
            html: LabEmails.EVENT_CLAIM_CREDIT.body(user, event),
            attachments: [
              {
                filename: "certificate.pdf",
                contentType: "application/pdf",
                content: Buffer.from(
                  pdf.substr(pdf.indexOf(",") + 1),
                  "base64"
                ),
              },
            ],
          };

          await smtpService().sendMail(mailOptions);

          return res.status(HttpCodes.OK).json({});
        }

        return res.status(HttpCodes.BAD_REQUEST).json({
          msg: "Bad Request: This Event is not allowed to confirm",
        });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }
    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Event id is wrong" });
  };

  const claimAttendance = async (req, res) => {
    const { id } = req.body;
    const { user } = req;

    if (id) {
      try {
        let event = await Event.findOne({
          where: {
            id,
          },
        });

        if (!event) {
          return res.status(HttpCodes.BAD_REQUEST).json({
            msg: "Bad Request: This Event is not existed",
          });
        }

        event = event.toJSON();

        let mailOptions = {
          from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
          to: user.email,
          subject: LabEmails.EVENT_CLAIM_ATTENDANCE.subject(event.title),
          html: LabEmails.EVENT_CLAIM_ATTENDANCE.body(user, event),
        };

        await smtpService().sendMail(mailOptions);

        return res.status(HttpCodes.OK).json({});
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }
    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Event id is wrong" });
  };

  return {
    create,
    getAllEvents,
    getEvent,
    updateEvent,
    updateEventStatus,
    emailAfterEventThread,
    getEventUsers,
    remove,
    sendMessageToParticipants,
    sendTestMessage,
    downloadICS,
    getChannelEvents,
    deleteChannelEvent,
    resetEmailReminders,
    claimCredit,
    claimAttendance,
  };
};

module.exports = EventController;
