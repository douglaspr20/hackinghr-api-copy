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

const Event = db.Event;
const User = db.User;
const QueryTypes = Sequelize.QueryTypes;

const EventController = () => {
  const setEventReminders = (event) => {
    const dateBefore24Hours = moment(event.startDate).subtract(1, "days");
    const interval1 = `0 ${dateBefore24Hours.minutes()} ${dateBefore24Hours.hours()} ${dateBefore24Hours.date()} ${dateBefore24Hours.month()} *`;
    const dateBefore2Hours = moment(event.startDate).subtract(45, "minutes");
    const interval2 = `0 ${dateBefore2Hours.minutes()} ${dateBefore2Hours.hours()} ${dateBefore2Hours.date()} ${dateBefore2Hours.month()} *`;
    
    console.log('****** set event reminders ', interval1, interval2)

    cronService().addTask(`${event.title}-24`, interval1, true, async () => {
      const targetEvent = await Event.findOne({ where: { id: event.id } });
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
          const smtpTransort = {
            service: "gmail",
            auth: {
              user: process.env.FEEDBACK_EMAIL_CONFIG_USER,
              pass: process.env.FEEDBACK_EMAIL_CONFIG_PASSWORD,
            },
          };
          let mailOptions = {
            from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
            to: user.email,
            subject: LabEmails.EVENT_REMINDER_45_MINUTES.subject(targetEvent),
            html: LabEmails.EVENT_REMINDER_45_MINUTES.body(user, targetEvent),
          };

          console.log('****** mailOptions ', mailOptions);

          return smtpService().sendMail(smtpTransort, mailOptions);
        })
      );
      // const targetEvent = await Event.findOne({ where: { id: event.id } });
      // const eventUsers = await Promise.all(
      //   (targetEvent.users || []).map((user) => {
      //     return User.findOne({
      //       where: {
      //         id: user,
      //       },
      //     });
      //   })
      // );

      // console.log('**** 24 event reminder,', eventUsers.map(item => item.email))

      // const values = await Promise.all(
      //   eventUsers.map((user) => {
      //     // const targetEventDate = moment(targetEvent.startDate);
      //     const smtpTransort = {
      //       service: "gmail",
      //       auth: {
      //         user: process.env.FEEDBACK_EMAIL_CONFIG_USER,
      //         pass: process.env.FEEDBACK_EMAIL_CONFIG_PASSWORD,
      //       },
      //     };
      //     let mailOptions = {
      //       from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
      //       to: user.email,
      //       // subject: LabEmails.EVENT_REMINDER_24_HOURS.subject(targetEvent),
      //       // html: LabEmails.EVENT_REMINDER_24_HOURS.body(
      //       //   user,
      //       //   targetEvent,
      //       //   targetEventDate.format("MMM DD"),
      //       //   targetEventDate.format("h:mm a")
      //       // ),
      //       subject: LabEmails.EVENT_REMINDER_45_MINUTES.subject(targetEvent),
      //       html: LabEmails.EVENT_REMINDER_45_MINUTES.body(user, targetEvent),
      //     };

      //     const promise = smtpService().sendMail(smtpTransort, mailOptions);
      //     console.log('************ smtpTransort ', smtpTransort);
      //     console.log('************ mailOptions ', mailOptions, promise instanceof Promise);

      //     return promise;
      //   })
      // );

      // console.log('*** promise all **** ', values);
    });

    cronService().addTask(`${event.title}-45`, interval2, true, async () => {
      console.log('********* event 45 minutes hours later', event)
      const targetEvent = await Event.findOne({ where: { id: event.id } });
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
          const smtpTransort = {
            service: "gmail",
            auth: {
              user: process.env.FEEDBACK_EMAIL_CONFIG_USER,
              pass: process.env.FEEDBACK_EMAIL_CONFIG_PASSWORD,
            },
          };
          let mailOptions = {
            from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
            to: user.email,
            subject: LabEmails.EVENT_REMINDER_45_MINUTES.subject(targetEvent),
            html: LabEmails.EVENT_REMINDER_45_MINUTES.body(user, targetEvent),
          };

          return smtpService().sendMail(smtpTransort, mailOptions);
        })
      );
    });
  };

  const removeEventReminders = (event) => {
    cronService().stopTask(`${event.title}-24`);
    cronService().stopTask(`${event.title}-2`);
  };

  const sendParticipantsListToOrganizer = async (event) => {
    const targetEvent = await Event.findOne({ where: { id: event.id } });
    const eventUsers = await Promise.all(
      (targetEvent.users || []).map((user) => {
        return User.findOne({
          where: {
            id: user,
          },
        });
      })
    );
    const smtpTransort = {
      service: "gmail",
      auth: {
        user: process.env.FEEDBACK_EMAIL_CONFIG_USER,
        pass: process.env.FEEDBACK_EMAIL_CONFIG_PASSWORD,
      },
    };
    let mailOptions = {
      from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
      to: event.organizerEmail,
      subject: LabEmails.PARTICIPANTS_LIST_TO_ORGANIZER.subject(),
      html: LabEmails.PARTICIPANTS_LIST_TO_ORGANIZER.body(eventUsers),
    };
    await smtpService().sendMail(smtpTransort, mailOptions);
  };

  const setOrganizerReminders = (event) => {
    const dates = [
      moment(event.startDate).subtract(1, "days"),
      moment(event.startDate).subtract(2, "hours"),
      moment(event.startDate).subtract(30, "minutes"),
    ];
    dates.forEach((date, index) => {
      const interval = `0 ${date.minutes()} ${date.hours()} ${date.date()} ${date.month()} *`;
      cronService().addTask(
        `${event.title}-participant-list-reminder-${index}`,
        interval,
        true,
        () => sendParticipantsListToOrganizer(event)
      );
    });
  };

  const sendMessage = async (users, message) => {
    const smtpTransort = {
      service: "gmail",
      auth: {
        user: process.env.FEEDBACK_EMAIL_CONFIG_USER,
        pass: process.env.FEEDBACK_EMAIL_CONFIG_PASSWORD,
      },
    };
    let mailOptions = {
      from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
      subject: "Message",
      html: `
        <p>
          ${message}
        </p>
      `,
    };

    await Promise.all(
      users.map((user) => {
        mailOptions = {
          ...mailOptions,
          to: user.email,
        };

        return smtpService().sendMail(smtpTransort, mailOptions);
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
        // setOrganizerReminders(event);

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

      const prevEvent = await Event.findOne({
        where: {
          id,
        },
      });

      if (!prevEvent) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request: event not found." });
      }

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
    try {
      const events = await Event.findAll();

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
        const prevEvent = await Event.findOne({ where: { id: eventId } });
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

      const smtpTransort = {
        service: "gmail",
        auth: {
          user: process.env.FEEDBACK_EMAIL_CONFIG_USER,
          pass: process.env.FEEDBACK_EMAIL_CONFIG_PASSWORD,
        },
      };

      let mailOptions = {
        from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
        subject: `Did you attend ${event.title}? – Get Your Digital Certificate!`,
      };

      requests = users.map((user) => {
        mailOptions.to = user.email;
        mailOptions.html = `
          Hi ${user.firstName},
          <br/>
          Were you able to attend our ${event.title} event?
          <br/>
          <br/>
          If so, please go back to the Hacking HR LAB, click on Events and My Past Events, and certify your attendance.
          <br/>
          And if you are a Hacking HR LAB PREMIUM Member, you will be able to claim your digital certificate of participation and (if applicable) HR recertification credits.
          <br/>
          <br/>
          Thank you! We hope to see you in many more events!
          <br/>
          Hacking HR Team
        `;

        console.log("**** mailOptions = ", mailOptions);
        return smtpService().sendMail(smtpTransort, mailOptions);
      });
      await Promise.all(requests);
      console.log("******* sent !!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    } catch (error) {
      console.log(error);
    }
  };

  const emailAfterEventThread = async () => {
    console.log("***** calling emailAfterEvent", moment().toString());

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

  const sendMessageToParticipants = async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;

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

        sendMessage(users, message);

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
  };
};

module.exports = EventController;
