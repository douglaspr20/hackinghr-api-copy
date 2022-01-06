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
        const annualConferenceClassUser =
          await AnnualConferenceClassUser.findAll({
            include: [
              {
                model: AnnualConferenceClass,
                where: {
                  AnnualConferenceId: conference,
                },

                required: true,
              },
            ],
            where: {
              UserId: req.user.id,
            },
          });
        return res.status(HttpCodes.OK).json({ annualConferenceClassUser });
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
          AnnualConferenceClassId: req.body.SessionClassId,
          UserId: req.user.id,
        },
      });

      if (!annualConferenceClassUser) {
        add({ ...req.body, UserId: req.user.id });
      } else {
        if (req.body.progressVideo > annualConferenceClassUser.progressVideo) {
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
    const { progressVideo, UserId, SessionClassId } = params;
    try {
      const newData = {
        progressVideo,
        UserId,
        AnnualConferenceClassId: SessionClassId,
      };
      await AnnualConferenceClassUser.create(newData);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Method to update Course Class User object
   */
  const update = async (params) => {
    const { progressVideo, UserId, SessionClassId, viewed } = params;
    try {
      let newData = {
        progressVideo,
        UserId,
        AnnualConferenceClassId: SessionClassId,
      };

      if (viewed) {
        newData = {
          ...newData,
          viewed,
        };
      }
      await AnnualConferenceClassUser.update(newData, {
        where: {
          AnnualConferenceClassId: newData.AnnualConferenceClassId,
          UserId: newData.UserId,
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
