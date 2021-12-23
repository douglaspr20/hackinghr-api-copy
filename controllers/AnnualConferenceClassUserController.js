const db = require("../models");
const HttpCodes = require("http-codes");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");

const AnnualConferenceClassUser = db.AnnualConferenceClassUser;
const AnnualConferenceClass = db.AnnualConferenceClass;

const AnnualConferenceClassUserController = () => {
  /**
   * Method to get Course object
   * @param {*} req
   * @param {*} res
   */
  const getProgressAnnualConferenceByUser = async (req, res) => {
    const { conference } = req.params;
    if (conference) {
      try {
        const annualConferenceClass = await AnnualConferenceClassUser.findAll({
          where: {
            [Op.and]: [{ UserId: req.user.id }],
          },
          include: [
            {
              model: AnnualConferenceClass,
              where: {
                id: Sequelize.col(
                  "AnnualConferenceClassUsers.AnnualConferenceClassId"
                ),
              },
              required: true,
            },
          ],
        });

        console.log(annualConferenceClass);

        return;
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

  /**
   * Method to add CourseClassUser object
   * @param {*} req
   * @param {*} res
   */
  const setProgress = async (req, res) => {
    try {
      let annualConferenceClassUser = await AnnualConferenceClassUser.findOne({
        where: {
          CourseClassId: req.body.annualConferenceClassId,
          UserId: req.user.id,
        },
      });

      if (!annualConferenceClassUser) {
        add({ ...req.body, UserId: req.user.id });
      } else {
        if (req.body.progressVideo > courseClassUser.progressVideo) {
          update({ ...req.body, UserId: req.user.id });
        } else if (req.body.viewed) {
          update({ ...req.body, UserId: req.user.id });
        }
      }

      return res.status(HttpCodes.OK).send();
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  /**
   * Method to add CourseClassUser object
   */
  const add = async (params) => {
    try {
      await AnnualConferenceClassUser.create(params);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Method to update Course Class User object
   */
  const update = async (params) => {
    try {
      await AnnualConferenceClassUser.update(params, {
        where: {
          AnnualConferenceClassId: params.AnnualConferenceClassId,
          UserId: params.UserId,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  return {
    getProgressAnnualConferenceByUser,
    add,
    update,
    setProgress,
  };
};

module.exports = AnnualConferenceClassUserController;
