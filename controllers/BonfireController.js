const db = require("../models");
const HttpCodes = require("http-codes");
const moment = require("moment-timezone");
const { Op, Sequelize } = require("sequelize");
const isEmpty = require("lodash/isEmpty");
const { LabEmails } = require("../enum");
const { convertToLocalTime } = require("../utils/format");
const smtpService = require("../services/smtp.service");
const TimeZoneList = require("../enum/TimeZoneList");
const {
  googleCalendar,
  yahooCalendar,
  generateIcsCalendar,
} = require("../utils/generateCalendars");

const Bonfire = db.Bonfire;
const User = db.User;

const BonfireController = () => {
  const create = async (req, res) => {
    const reqBonfire = req.body;

    try {
      let bonfireInfo = {
        ...reqBonfire,
      };

      const users = await User.findAll({
        where: {
          [Op.and]: [
            { percentOfCompletion: 100 },
            { attendedToConference: 1 },
            {
              id: {
                [Op.ne]: bonfireInfo.bonfireCreator,
              },
            },
            {
              email: {
                [Op.ne]: "douglas.eduardo2000@gmail.com",
              },
            },
          ],
        },
        order: [[Sequelize.fn("RANDOM")]],
        limit: 20,
      });

      const invitedUsers = users.map((user) => {
        return user.dataValues.id;
      });

      const userAlwaysInvited = await User.findOne({
        where: { email: "douglas.eduardo2000@gmail.com" },
      });

      if (userAlwaysInvited?.dataValues?.id)
        invitedUsers.push(userAlwaysInvited.dataValues.id);
      users.push(userAlwaysInvited);

      bonfireInfo = {
        ...bonfireInfo,
        invitedUsers,
      };

      const bonfire = await Bonfire.create(bonfireInfo);

      const { dataValues: bonfireCreatorInfo } = await User.findOne({
        where: {
          id: bonfireInfo.bonfireCreator,
        },
      });

      await Promise.all(
        invitedUsers.map((idUser) => {
          return User.update(
            {
              bonfires: Sequelize.fn(
                "array_append",
                Sequelize.col("bonfires"),
                bonfire.id
              ),
            },
            {
              where: { id: idUser },
              returning: true,
              plain: true,
            }
          );
        })
      );

      await User.update(
        {
          bonfires: Sequelize.fn(
            "array_append",
            Sequelize.col("bonfires"),
            bonfire.id
          ),
        },
        {
          where: { id: bonfireInfo.bonfireCreator },
          returning: true,
          plain: true,
        }
      );

      await Promise.resolve(
        (() => {
          const timezone = TimeZoneList.find(
            (timezone) =>
              timezone.value === bonfireInfo.timezone ||
              timezone.text === bonfireInfo.timezone
          );
          const offset = timezone.offset;
          const targetBonfireDate = moment(bonfire.dataValues.startTime)
            .tz(timezone.utc[0])
            .utcOffset(offset, false);

          let mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: bonfireCreatorInfo.email,
            subject: LabEmails.BONFIRE_CREATOR.subject,
            html: LabEmails.BONFIRE_CREATOR.body(
              bonfireCreatorInfo,
              bonfire,
              targetBonfireDate.format("MMM DD"),
              targetBonfireDate.format("h:mm a"),
              timezone.value
            ),
          };
          console.log("***** mailOptions ", mailOptions);

          return smtpService().sendMailUsingSendInBlue(mailOptions);
        })()
      );

      await Promise.all(
        users.map((user) => {
          const timezone = TimeZoneList.find(
            (timezone) =>
              timezone.value === bonfireInfo.timezone ||
              timezone.text === bonfireInfo.timezone
          );
          const offset = timezone.offset;
          const _user = user.toJSON();
          const targetBonfireStartDate = moment(bonfire.dataValues.startTime)
            .tz(timezone.utc[0])
            .utcOffset(offset, true);

          const targetBonfireEndDate = moment(bonfire.dataValues.endTime)
            .tz(timezone.utc[0])
            .utcOffset(offset, true);

          const timezoneUser = TimeZoneList.find(
            (timezone) =>
              timezone.value === _user.timezone ||
              timezone.text === _user.timezone
          );

          const googleLink = googleCalendar(
            bonfire.dataValues,
            targetBonfireStartDate,
            targetBonfireEndDate,
            timezoneUser.utc[0]
          );
          const yahooLink = yahooCalendar(
            bonfire.dataValues,
            targetBonfireStartDate,
            targetBonfireEndDate,
            timezoneUser.utc[0]
          );

          const calendarInvite = generateIcsCalendar(
            bonfire.dataValues,
            targetBonfireStartDate,
            targetBonfireEndDate,
            timezoneUser.utc[0]
          );

          let icsContent = calendarInvite.toString();

          let mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: _user.email,
            subject: LabEmails.BONFIRE_INVITATION.subject,
            html: LabEmails.BONFIRE_INVITATION.body(
              _user,
              bonfire,
              bonfireCreatorInfo,
              targetBonfireStartDate.format("MMM DD"),
              targetBonfireStartDate.format("h:mm a"),
              targetBonfireEndDate.format("h:mm a"),
              timezone.value,
              googleLink,
              yahooLink
            ),
            icalEvent: {
              filename: `${bonfire.dataValues.title}.ics`,
              method: "request",
              content: icsContent,
            },
          };

          console.log("***** mailOptions ", mailOptions);

          return smtpService().sendMailUsingSendInBlue(mailOptions);
        })
      );

      return res.status(HttpCodes.OK).json({ bonfire });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error", error });
    }
  };

  const getAll = async (req, res) => {
    const filter = req.query;
    let where = {
      endTime: {
        [Op.gte]: moment().utc().format(),
      },
    };

    try {
      if (filter.topics && !isEmpty(JSON.parse(filter.topics))) {
        where = {
          ...where,
          categories: {
            [Op.overlap]: JSON.parse(filter.topics),
          },
        };
      }

      const bonfires = await Bonfire.findAll({
        where,
        order: [["startTime"]],
      });

      return res.status(HttpCodes.OK).json({ bonfires });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const get = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        let bonfire = await Bonfire.findOne({
          where: {
            id,
          },
        });

        if (!bonfire) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Bad Request: Bonfire not found" });
        }

        return res.status(HttpCodes.OK).json({ bonfire });
      } catch (err) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Bonfire id is wrong" });
  };

  const update = async (req, res) => {
    const { id } = req.params;
    const reqBonfire = req.body;

    if (id) {
      try {
        let bonfireInfo = {
          ...reqBonfire,
        };

        const prevBonfire = await Bonfire.findOne({
          where: {
            id,
          },
        });

        if (!prevBonfire) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: Bonfire not found." });
        }

        const [numberOfAffectedRows, affectedRows] = await Bonfire.update(
          bonfireInfo,
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
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Bonfire id is wrong" });
  };

  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        await Bonfire.destroy({
          where: {
            id,
          },
        });

        return res.status(HttpCodes.OK).json({});
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }
  };

  const downloadICS = async (req, res) => {
    const { id } = req.params;

    try {
      const bonfire = await Bonfire.findOne({
        where: { id },
      });

      if (!bonfire) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      let startDate = moment(bonfire.startTime).format("YYYY-MM-DD");

      let endDate = moment(bonfire.endTime).format("YYYY-MM-DD");

      const startTime = moment(bonfire.startTime).format("HH:mm:ss");

      const endTime = moment(bonfire.endTime).format("HH:mm:ss");

      let formatStartDate = moment(`${startDate}  ${startTime}`);

      let formatEndDate = moment(`${endDate}  ${endTime}`);

      startDate = convertToLocalTime(formatStartDate, "YYYY-MM-DD h:mm a");

      endDate = convertToLocalTime(formatEndDate, "YYYY-MM-DD h:mm a");

      const localTimezone = moment.tz.guess();

      const calendarInvite = smtpService().generateCalendarInvite(
        startDate,
        endDate,
        bonfire.title,
        bonfire.description,
        "https://www.hackinghrlab.io/global-conference",
        // event.location,
        `${process.env.DOMAIN_URL}${bonfire.id}`,
        "hacking Lab HR",
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
        `attachment; filename=${encodeURIComponent(bonfire.title)}.ics`
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

  return {
    create,
    getAll,
    get,
    update,
    remove,
    downloadICS,
  };
};

module.exports = BonfireController;
