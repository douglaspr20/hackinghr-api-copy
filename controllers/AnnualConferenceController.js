const db = require("../models");
const HttpCodes = require("http-codes");
const Sequelize = require("sequelize");

const AnnualConference = db.AnnualConference;
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
    const { startTime, endTime } = req.query;

    try {
      let where = "";

      if (startTime && endTime) {
        where = `WHERE public."AnnualConferences"."startTime" >= '${startTime}' AND public."AnnualConferences"."startTime" <= '${endTime}'`;
      }

      const query = `
        SELECT public."AnnualConferences".*, public."Instructors".id as userId, public."Instructors"."name", public."Instructors"."link" as linkSpeaker, public."Instructors".image, public."Instructors"."description" as descriptionSpeaker
        FROM public."AnnualConferences"
        LEFT JOIN public."Instructors" ON public."Instructors".id = ANY (public."AnnualConferences".speakers::int[])
        ${where}
      `;

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

  return {
    create,
    getAll,
    get,
    update,
    remove,
  };
};

module.exports = AnnualConferenceController;
