const db = require("../models");
const HttpCodes = require("http-codes");
const isEmpty = require("lodash/isEmpty");
const { Op } = require("sequelize");
const smtpService = require("../services/smtp.service");
const cryptoService = require("../services/crypto.service");
const { LabEmails } = require("../enum");

const ConferenceLibrary = db.ConferenceLibrary;

const ConferenceController = () => {
  const create = async (req, res) => {
    const { body } = req;

    if (body.title) {
      try {
        let conferenceInfo = {
          ...body,
        };

        const newConference = await ConferenceLibrary.create(conferenceInfo);

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

  const getAll = async (req, res) => {
    const filter = req.query;

    try {
      let where = {};

      if (filter.topics && !isEmpty(JSON.parse(filter.topics))) {
        where = {
          ...where,
          categories: {
            [Op.overlap]: JSON.parse(filter.topics),
          },
        };
      }

      if (filter.year && !isEmpty(JSON.parse(filter.year))) {
        where = {
          ...where,
          year: {
            [Op.in]: JSON.parse(filter.year),
          },
        };
      }

      if (filter.meta) {
        where = {
          ...where,
          meta: {
            [Op.iLike]: `%${filter.meta}%`,
          },
        };
      }

      const conferences = await ConferenceLibrary.findAndCountAll({
        where,
        offset: (filter.page - 1) * filter.num,
        limit: filter.num,
        order: [
          ["year", "DESC"],
          ["order", "DESC"],
        ],
      });

      return res.status(HttpCodes.OK).json({ conferences });
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
      const conference = await ConferenceLibrary.findOne({
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

  const update = async (req, res) => {
    const { id } = req.params;
    const conference = req.body;

    try {
      let conferenceInfo = {
        ...conference,
      };

      const prevConference = await ConferenceLibrary.findOne({
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
        await ConferenceLibrary.update(conferenceInfo, {
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

  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        await ConferenceLibrary.destroy({
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
      .json({ msg: "Bad Request: category id is wrong" });
  };

  const claim = async (req, res) => {
    const { id } = req.body;
    const { user } = req;

    if (id) {
      try {
        let library = await ConferenceLibrary.findOne({
          where: {
            id,
          },
        });

        library = library.toJSON();

        library = {
          ...library,
          shrmCode: cryptoService().decrypt(library.shrmCode),
          hrciCode: cryptoService().decrypt(library.hrciCode),
        };

        if (library.showClaim === 1) {
          let mailOptions = {
            from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
            to: user.email,
            subject: LabEmails.LIBRARY_CLAIM.subject(library.title),
            html: LabEmails.LIBRARY_CLAIM.body(user, library),
          };

          await smtpService().sendMail(mailOptions);

          return res.status(HttpCodes.OK).json({});
        }

        return res.status(HttpCodes.BAD_REQUEST).json({
          msg: "Bad Request: This conference library is not allowed to confirm",
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
      .json({ msg: "Bad Request: Conference library id is wrong" });
  };

  const markAsViewed = async (req, res) => {
    const { id: libraryId, mark } = req.body;
    const { id: userId } = req.token;

    if (id) {
      try {
        let prevLibrary = await ConferenceLibrary.findOne({ where: { id: libraryId } });
        prevLibrary = prevLibrary.toJSON();
        const [numberOfAffectedRows, affectedRows] =
          await ConferenceLibrary.update(
            {
              viewed: { ...prevLibrary.viewed, [userId]: mark },
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
    }
    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Conference library id is wrong" });
  };

  return {
    create,
    getAll,
    get,
    update,
    remove,
    claim,
    markAsViewed,
  };
};

module.exports = ConferenceController;
