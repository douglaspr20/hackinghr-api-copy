const db = require("../models");
const { Op } = require("sequelize");
const { isEmpty } = require("lodash");
const HttpCodes = require("http-codes");
const { LabEmails } = require("../enum");
const smtpService = require("../services/smtp.service");

const User = db.User;

const MatchmakingController = () => {
  const getMatchmake = async (req, res) => {
    const filters = req.query;

    let where = { percentOfCompletion: 100 };

    try {
      if (!isEmpty(filters)) {
        if (!isEmpty(JSON.parse(filters.countries))) {
          where = {
            ...where,
            location: {
              [Op.in]: JSON.parse(filters.countries),
            },
          };
        }

        if (!isEmpty(JSON.parse(filters.topicsOfInterest))) {
          where = {
            ...where,
            topicsOfInterest: {
              [Op.overlap]: JSON.parse(filters.topicsOfInterest),
            },
          };
        }

        if (!isEmpty(JSON.parse(filters.recentJobLevel))) {
          where = {
            ...where,
            recentJobLevel: {
              [Op.in]: JSON.parse(filters.recentJobLevel),
            },
          };
        }

        if (!isEmpty(JSON.parse(filters.recentWorkArea))) {
          where = {
            ...where,
            recentWorkArea: {
              [Op.overlap]: JSON.parse(filters.recentWorkArea),
            },
          };
        }

        if (!isEmpty(JSON.parse(filters.sizeOfOrganization))) {
          where = {
            ...where,
            sizeOfOrganization: {
              [Op.in]: JSON.parse(filters.sizeOfOrganization),
            },
          };
        }
      }

      const matchmakingUsers = await User.findAll({
        attributes: [
          "id",
          "titleProfessions",
          "sizeOfOrganization",
          "location",
        ],
        where,
      });

      return res.status(HttpCodes.OK).json({ matchmakingUsers });
    } catch (error) {
      console.log(error);

      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const sendMatchEmail = async (req, res) => {
    const { id } = req.body;

    try {
      const user = await User.findOne({
        where: {
          id,
        },
      });

      if (!user) {
        return res.status(HttpCodes.NOT_FOUND).json({
          msg: "User not found.",
          error,
        });
      }

      const mailOptions = {
        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
        to: "enrique@hackinghr.io",
        subject: LabEmails.MATCHMAKE_USERS.subject(),
        html: LabEmails.MATCHMAKE_USERS.body(),
        contentType: "text/html",
      };

      await smtpService().sendMailUsingSendInBlue(mailOptions);

      return res.status(HttpCodes.OK).json({});
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  return {
    getMatchmake,
    sendMatchEmail,
  };
};

module.exports = MatchmakingController;
