const db = require("../models");
const HttpCodes = require("http-codes");
const Sequelize = require("sequelize");

const QueryTypes = Sequelize.QueryTypes;
const AnnualConferenceClass = db.AnnualConferenceClass;

const AnnualConferenceClassController = () => {
  /**
   * Method to get all AnnualConferenceClass objects
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    try {
      let annualConferenceClass = await AnnualConferenceClass.findAll({
        order: [["createdAt", "DESC"]],
      });
      if (!courseClass) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res.status(HttpCodes.OK).json({ annualConferenceClass });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to get AnnualConferenceClass by Conference object
   * @param {*} req
   * @param {*} res
   */
  const getByAnnualConference = async (req, res) => {
    const { conference } = req.params;
    if (conference) {
      try {
        const annualConferenceClasses = await AnnualConferenceClass.findAll({
          where: {
            AnnualConferenceId: conference,
          },
          order: [["createdAt", "ASC"]],
        });

        if (!annualConferenceClasses) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ annualConferenceClasses });
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
   * Method to get CourseClass object
   * @param {*} req
   * @param {*} res
   */
  const get = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        const annualConferenceClass = await AnnualConferenceClass.findOne({
          where: {
            id,
          },
        });

        if (!annualConferenceClass) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ annualConferenceClass });
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
   * Method to add AnnualConferenceClass object
   * @param {*} req
   * @param {*} res
   */
  const add = async (req, res) => {
    try {
      await AnnualConferenceClass.create({ ...req.body });
      return res.status(HttpCodes.OK).send();
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to update AnnualConferenceClass object
   * @param {*} req
   * @param {*} res
   */
  const update = async (req, res) => {
    const { id } = req.params;
    const { body } = req;

    if (id) {
      try {
        let data = {};
        let fields = ["title", "description", "videoUrl", "duration", "topics"];
        for (let item of fields) {
          if (body[item]) {
            data = { ...data, [item]: body[item] };
          }
        }
        await AnnualConferenceClass.update(data, {
          where: { id },
        });

        return res.status(HttpCodes.OK).send();
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
   * Method to delete AnnualConferenceClass object
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        await AnnualConferenceClass.destroy({
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
    getAll,
    getByAnnualConference,
    get,
    add,
    update,
    remove,
  };
};

module.exports = AnnualConferenceClassController;
