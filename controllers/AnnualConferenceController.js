const db = require("../models");
const HttpCodes = require("http-codes");
const { Op, Sequelize } = require("sequelize");
const moment = require("moment-timezone");
const smtpService = require("../services/smtp.service");

const AnnualConference = db.AnnualConference;
const User = db.User;
const QueryTypes = Sequelize.QueryTypes;

const AnnualConferenceController = () => {
  const create = async (req, res) => {
    const { body } = req;

    if (body.title) {
      try {
        let conferenceInfo = {
          ...body,
        };

        const newConference = await AnnualConference.create(conferenceInfo);

        if (!newConference) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ conference: newConference });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error", error: error });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Title is needed." });
  };

  const update = async (req, res) => {
    const { id } = req.params;
    const conference = req.body;

    try {
      let conferenceInfo = {
        ...conference,
      };

      const prevConference = await AnnualConference.findOne({
        where: {
          id,
        },
      });

      if (!prevConference) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request: Conference not found." });
      }

      const [numberOfAffectedRows, affectedRows] =
        await AnnualConference.update(conferenceInfo, {
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
  };

  const get = async (req, res) => {
    const { id } = req.params;

    try {
      const conference = await AnnualConference.findOne({
        where: {
          id,
        },
      });

      if (!conference) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Bad Request: Conferernce not found" });
      }

      return res.status(HttpCodes.OK).json({ conference });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getAll = async (req, res) => {
    const { startTime, endTime, meta } = req.query;
    try {
      let where = "";

      if (startTime && endTime) {
        where = `WHERE (public."AnnualConferences"."startTime" >= '${startTime}' AND public."AnnualConferences"."startTime" <= '${endTime}')`;
      }

      if (meta) {
        where += `AND (public."AnnualConferences"."title" LIKE '%${meta}%' OR public."AnnualConferences"."description" LIKE '%${meta}%' 
        OR public."AnnualConferences"."type" LIKE '%${meta}%' OR public."Instructors"."name" LIKE '%${meta}%' 
        OR public."Instructors"."description" LIKE '%${meta}%' OR public."AnnualConferences".categories::text LIKE '%${meta}%' )`;
      }

      const query = `
        SELECT public."AnnualConferences".*, public."Instructors".id as instructorId, public."Instructors"."name", public."Instructors"."link" as linkSpeaker, 
        public."Instructors".image, public."Instructors"."description" as descriptionSpeaker
        FROM public."AnnualConferences"
        LEFT JOIN public."Instructors" ON public."Instructors".id = ANY (public."AnnualConferences".speakers::int[]) ${where}`;

      const sessionList = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      return res.status(HttpCodes.OK).json({ conferences: sessionList });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getSessionsUser = async (req, res) => {
    const { userId } = req.query;

    try {
      const query = `
      SELECT public."AnnualConferences".*, public."Instructors".id as instructorId, public."Instructors"."name", public."Instructors"."link" as linkSpeaker, 
      public."Instructors".image, public."Instructors"."description" as descriptionSpeaker
      FROM public."Users"
      INNER JOIN public."AnnualConferences" ON public."AnnualConferences".id = ANY (public."Users".sessions::int[])
      INNER JOIN public."Instructors" ON public."Instructors".id = ANY (public."AnnualConferences".speakers::int[])
      WHERE public."Users"."id" = ${userId}
    `;

      const sessionList = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      return res.status(HttpCodes.OK).json({ sessionsUser: sessionList });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getParticipants = async (req, res) => {
    const { filters, num, page, order } = req.query;

    try {
      let where = {
        [Op.and]: [{ attendedToConference: 1 }],
      };

      if (filters) {
        where[Op.and].push(
          { topicsOfInterest: { [Op.overlap]: JSON.parse(filters).topics } },
          { id: { [Op.ne]: JSON.parse(filters).userId } }
        );
      }

      let participants = await User.findAll({
        where,
        order: order ? [order] : [[Sequelize.fn("RANDOM")]],
        limit: 50,
      });

      return res.status(HttpCodes.OK).json({ participants });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        await AnnualConference.destroy({
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

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: id is wrong" });
  };

  const downloadICS = async (req, res) => {
    const { id } = req.params;
    const { userTimezone } = req.query;

    try {
      const annualConference = await AnnualConference.findOne({
        where: { id },
      });

      if (!annualConference) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      const timezone = TimeZoneList.find(
        (timezone) =>
          timezone.value === userTimezone || timezone.text === userTimezone
      );

      const targetBonfireStartDate = moment
        .utc(annualConference.startTime)
        .tz(timezone.utc[0]);

      const targetBonfireEndDate = moment
        .utc(annualConference.endTime)
        .tz(timezone.utc[0]);

      let startDate = targetBonfireStartDate.format("YYYY-MM-DD");

      let endDate = targetBonfireEndDate.format("YYYY-MM-DD");

      const startTime = targetBonfireStartDate.format("HH:mm:ss");

      const endTime = targetBonfireEndDate.format("HH:mm:ss");

      let formatStartDate = moment(`${startDate}  ${startTime}`);

      let formatEndDate = moment(`${endDate}  ${endTime}`);

      startDate = formatStartDate.format("YYYY-MM-DD h:mm a");

      endDate = formatEndDate.format("YYYY-MM-DD h:mm a");

      const localTimezone = moment.tz.guess();

      const calendarInvite = smtpService().generateCalendarInvite(
        startDate,
        endDate,
        annualConference.title,
        annualConference.description,
        "https://www.hackinghrlab.io/global-conference",
        // event.location,
        `${process.env.DOMAIN_URL}${annualConference.id}`,
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
        `attachment; filename=${encodeURIComponent(annualConference.title)}.ics`
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
    getSessionsUser,
    getParticipants,
    get,
    update,
    remove,
    downloadICS,
  };
};

module.exports = AnnualConferenceController;
