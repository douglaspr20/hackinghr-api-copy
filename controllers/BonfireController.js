const db = require("../models");
const HttpCodes = require("http-codes");
const moment = require("moment-timezone");
const { Op, Sequelize } = require("sequelize");
const { LabEmails } = require("../enum");
const { convertToLocalTime } = require("../utils/format");
const smtpService = require("../services/smtp.service");
const TimeZoneList = require("../enum/TimeZoneList");
const { googleCalendar, yahooCalendar } = require("../utils/generateCalendars");

const Bonfire = db.Bonfire;
const User = db.User;
const QueryTypes = Sequelize.QueryTypes;

const validatedUserToInvited = async (user, bonfireToCreate) => {
  const query = `
  SELECT public."Bonfires"."startTime", public."Bonfires"."endTime" FROM public."Users" 
  LEFT JOIN public."Bonfires" ON public."Bonfires".id = ANY (public."Users".bonfires::int[]) 
  WHERE (public."Users"."id" = ${
    user.id
  }) AND (public."Bonfires"."endTime" >= '${moment().utc().format()}')
`;
  try {
    const userBonfires = await db.sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    for (const bonfire of userBonfires) {
      if (bonfire.startTime === bonfireToCreate.startTime) {
        return null;
      }
    }

    return user;
  } catch (error) {
    console.log(error);
  }
};

const BonfireController = () => {
  const create = async (req, res) => {
    const reqBonfire = req.body;

    try {
      let bonfireInfo = {
        ...reqBonfire,
      };

      let users = await User.findAll({
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
                [Op.ne]: "enrique@hackinghr.io",
              },
            },
          ],
        },
        order: [[Sequelize.fn("RANDOM")]],
        limit: 20,
      });

      let usersValidated = [];

      for (const user of users) {
        const userValidate = await Promise.resolve(
          validatedUserToInvited(user.dataValues, bonfireInfo)
        );

        if (userValidate !== null) usersValidated.push(user);
      }

      const invitedUsers = usersValidated.map((user) => {
        return user.dataValues.id;
      });

      const userAlwaysInvited = await User.findOne({
        where: { email: "enrique@hackinghr.io" },
      });

      if (userAlwaysInvited?.dataValues?.id) {
        invitedUsers.push(userAlwaysInvited.dataValues.id);
        usersValidated.push(userAlwaysInvited);
      }

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

      await User.increment(
        {
          pointsConferenceLeaderboard: 500,
        },
        {
          where: { id: bonfireInfo.bonfireCreator },
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
        usersValidated.map((user) => {
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
            timezoneUser.utc[0]
          );
          const yahooLink = yahooCalendar(
            bonfire.dataValues,
            timezoneUser.utc[0]
          );

          // const calendarInvite = generateIcsCalendar(
          //   bonfire.dataValues,
          //   timezoneUser.utc[0]
          // );

          // let icsContent = calendarInvite.toString();

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
            // contentType: "text/calendar",
            // attachments: [
            //   {
            //     filename: `${bonfire.dataValues.title}-invite.ics`,
            //     content: icsContent,
            //     contentType: "application/ics; charset=UTF-8; method=REQUEST",
            //     contentDisposition: "inline",
            //   },
            // ],
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
    let where = `WHERE public."Bonfires"."endTime" >='${moment()
      .utc()
      .format()}'`;
    try {
      const query = `SELECT public."Bonfires".*, public."Users"."id" as "bonfireOrganizerId", public."Users"."firstName", public."Users"."lastName", public."Users"."img",
      public."Users"."company", public."Users"."titleProfessions", public."Users"."personalLinks" FROM public."Bonfires" LEFT JOIN public."Users" ON public."Users".id = public."Bonfires"."bonfireCreator" ${where}`;

      const bonfires = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
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

        const usersId = prevBonfire.dataValues.invitedUsers.concat(
          prevBonfire.dataValues.uninvitedJoinedUsers
        );

        const usersJoinedToBonfire = await Promise.all(
          usersId.map(async (userId) => {
            const { dataValues } = await User.findOne({
              where: { id: userId },
            });
            return dataValues;
          })
        );

        const [numberOfAffectedRows, affectedRows] = await Bonfire.update(
          bonfireInfo,
          {
            where: { id },
            returning: true,
            plain: true,
          }
        );

        await Promise.all(
          usersJoinedToBonfire.map((user) => {
            const timezone = TimeZoneList.find(
              (timezone) =>
                timezone.value === affectedRows.dataValues.timezone ||
                timezone.text === affectedRows.dataValues.timezone
            );
            const offset = timezone.offset;
            const targetBonfireStartDate = moment(
              affectedRows.dataValues.startTime
            )
              .tz(timezone.utc[0])
              .utcOffset(offset, true);

            const targetBonfireEndDate = moment(affectedRows.dataValues.endTime)
              .tz(timezone.utc[0])
              .utcOffset(offset, true);

            let mailOptions = {
              from: process.env.SEND_IN_BLUE_SMTP_SENDER,
              to: user.email,
              subject: LabEmails.BONFIRE_EDITED.subject(
                affectedRows.dataValues.title
              ),
              html: LabEmails.BONFIRE_EDITED.body(
                user,
                prevBonfire.dataValues.title,
                affectedRows.dataValues,
                targetBonfireStartDate.format("MMM DD"),
                targetBonfireStartDate.format("h:mm a"),
                targetBonfireEndDate.format("h:mm a"),
                timezone.value
              ),
            };

            console.log("***** mailOptions ", mailOptions);

            return smtpService().sendMailUsingSendInBlue(mailOptions);
          })
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
        const bonfireToDelete = await Bonfire.findOne({
          where: {
            id,
          },
        });

        if (!bonfireToDelete) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: Bonfire not found." });
        }

        const usersId = bonfireToDelete.invitedUsers.concat(
          bonfireToDelete.uninvitedJoinedUsers
        );

        const usersJoinedToBonfire = await Promise.all(
          usersId.map(async (userId) => {
            const { dataValues } = await User.findOne({
              where: { id: userId },
            });
            return dataValues;
          })
        );

        await Bonfire.destroy({
          where: {
            id,
          },
        });

        await Promise.all(
          usersId.map((userID) => {
            return User.update(
              {
                bonfires: Sequelize.fn(
                  "array_remove",
                  Sequelize.col("bonfires"),
                  id
                ),
              },
              {
                where: { id: userID },
                returning: true,
                plain: true,
              }
            );
          })
        );

        await Promise.all(
          usersJoinedToBonfire.map((user) => {
            const timezone = TimeZoneList.find(
              (timezone) =>
                timezone.value === bonfireToDelete.timezone ||
                timezone.text === bonfireToDelete.timezone
            );
            const offset = timezone.offset;
            const targetBonfireStartDate = moment(bonfireToDelete.startTime)
              .tz(timezone.utc[0])
              .utcOffset(offset, true);

            const targetBonfireEndDate = moment(bonfireToDelete.endTime)
              .tz(timezone.utc[0])
              .utcOffset(offset, true);

            let mailOptions = {
              from: process.env.SEND_IN_BLUE_SMTP_SENDER,
              to: user.email,
              subject: LabEmails.BONFIRE_DELETED.subject(bonfireToDelete.title),
              html: LabEmails.BONFIRE_DELETED.body(
                user,
                bonfireToDelete,
                targetBonfireStartDate.format("MMM DD"),
                targetBonfireStartDate.format("h:mm a"),
                targetBonfireEndDate.format("h:mm a"),
                timezone.value
              ),
            };

            console.log("***** mailOptions ", mailOptions);

            return smtpService().sendMailUsingSendInBlue(mailOptions);
          })
        );

        return res.status(HttpCodes.OK).json({});
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }
  };

  const inviteUser = async (req, res) => {
    const { id, userId } = req.params;

    try {
      const [numberOfAffectedRowsUser, affectedRowsUser] = await User.update(
        {
          bonfires: Sequelize.fn("array_append", Sequelize.col("bonfires"), id),
        },
        {
          where: { id: userId },
          returning: true,
          plain: true,
        }
      );

      const [numberOfAffectedRowsBonfire, affectedRowsBonfire] =
        await Bonfire.update(
          {
            usersInvitedByOrganizer: Sequelize.fn(
              "array_append",
              Sequelize.col("usersInvitedByOrganizer"),
              userId
            ),
          },
          {
            where: { id },
            returning: true,
            plain: true,
          }
        );

      const { dataValues: bonfireCreatorInfo } = await User.findOne({
        where: {
          id: affectedRowsBonfire.dataValues.bonfireCreator,
        },
      });

      await Promise.resolve(
        (() => {
          const timezone = TimeZoneList.find(
            (timezone) =>
              timezone.value === affectedRowsBonfire.dataValues.timezone ||
              timezone.text === affectedRowsBonfire.dataValues.timezone
          );
          const offset = timezone.offset;
          const _user = affectedRowsUser.dataValues;
          const targetBonfireStartDate = moment(
            affectedRowsBonfire.dataValues.startTime
          )
            .tz(timezone.utc[0])
            .utcOffset(offset, true);

          const targetBonfireEndDate = moment(
            affectedRowsBonfire.dataValues.endTime
          )
            .tz(timezone.utc[0])
            .utcOffset(offset, true);

          const timezoneUser = TimeZoneList.find(
            (timezone) =>
              timezone.value === _user.timezone ||
              timezone.text === _user.timezone
          );

          const googleLink = googleCalendar(
            affectedRowsBonfire.dataValues,
            timezoneUser.utc[0]
          );
          const yahooLink = yahooCalendar(
            affectedRowsBonfire.dataValues,
            timezoneUser.utc[0]
          );

          let mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: _user.email,
            subject: LabEmails.BONFIRE_INVITATION.subject,
            html: LabEmails.BONFIRE_INVITATION.body(
              _user,
              affectedRowsBonfire.dataValues,
              bonfireCreatorInfo,
              targetBonfireStartDate.format("MMM DD"),
              targetBonfireStartDate.format("h:mm a"),
              targetBonfireEndDate.format("h:mm a"),
              timezone.value,
              googleLink,
              yahooLink
            ),
          };

          console.log("***** mailOptions ", mailOptions);

          return smtpService().sendMailUsingSendInBlue(mailOptions);
        })()
      );

      return res
        .status(HttpCodes.OK)
        .json({ numberOfAffectedRowsBonfire, affectedRowsBonfire });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const downloadICS = async (req, res) => {
    const { id } = req.params;
    const { userTimezone } = req.query;

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

      const timezoneUser = TimeZoneList.find(
        (timezone) =>
          timezone.value === userTimezone || timezone.text === userTimezone
      );

      const convertedStartTime = moment
        .utc(bonfire.dataValues.startTime)
        .tz(timezoneUser.utc[0])
        .format();

      const convertedEndTime = moment
        .utc(bonfire.dataValues.endTime)
        .tz(timezoneUser.utc[0])
        .format();

      let startDate = moment(convertedStartTime).format("YYYY-MM-DD");

      let endDate = moment(convertedEndTime).format("YYYY-MM-DD");

      const startTime = moment(convertedStartTime).format("HH:mm:ss");

      startDate = moment(`${startDate}  ${startTime}`);

      const endTime = moment(convertedEndTime).format("HH:mm:ss");
      endDate = moment(`${endDate}  ${endTime}`);

      startDate = convertToLocalTime(startDate, "YYYY-MM-DD h:mm a");

      endDate = convertToLocalTime(endDate, "YYYY-MM-DD h:mm a");

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
    inviteUser,
    downloadICS,
  };
};

module.exports = BonfireController;
