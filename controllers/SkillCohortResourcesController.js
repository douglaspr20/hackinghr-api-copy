const db = require("../models");
const HttpCodes = require("http-codes");
const { Op } = require("sequelize");
const moment = require("moment-timezone");

const SkillCohortResources = db.SkillCohortResources;
const SkillCohort = db.SkillCohort;

const SkillCohortResourcesController = () => {
  /**
   * Create resources
   * @param {*} req
   * @param {*} res
   */
  const create = async (req, res) => {
    const { body } = req;

    try {
      const skillCohortResource = await SkillCohortResources.create({
        ...body,
      });

      return res.status(HttpCodes.OK).json({ skillCohortResource });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  /**
   * Get all resources
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    const { filter } = req.query;
    const { skillCohortId } = req.params;

    let where = {
      SkillCohortId: skillCohortId,
    };

    try {
      if (filter) {
        where = {
          ...where,
          releaseDate: {
            [Op.lte]: moment(filter)
              .tz("America/Los_Angeles")
              .format("YYYY-MM-DD HH:mm:ssZ"),
          },
        };
      }

      const skillCohortResources = await SkillCohortResources.findAll({
        where,
        order: [["releaseDate"]],
      });

      return res.status(HttpCodes.OK).json({ skillCohortResources });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };

  /**
   * Get resource
   * @param {*} req
   * @param {*} res
   */
  const get = async (req, res) => {
    const { resourceId } = req.params;

    if (resourceId) {
      try {
        const skillCohortResource = await SkillCohortResources.findOne({
          where: {
            id: resourceId,
          },
        });

        if (!skillCohortResource) {
          return res.status(HttpCodes.BAD_REQUEST).json({
            msg: "Bad Request: Skill Cohort Resource not found.",
          });
        }

        return res.status(HttpCodes.OK).json({ skillCohortResource });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error." });
      }
    }
  };

  /**
   * Remove a resource
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    const { resourceId } = req.params;

    if (resourceId) {
      try {
        await SkillCohortResources.destroy({
          where: {
            id: resourceId,
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
      .json({ msg: "Bad Request: Skill Cohort id is wrong." });
  };

  /**
   * Update a resource
   * @param {*} req
   * @param {*} res
   */
  const update = async (req, res) => {
    const { resourceId } = req.params;
    const reqSkillCohortResource = req.body;

    if (resourceId) {
      try {
        const [numberOfAffectedRows, affectedRows] =
          await SkillCohortResources.update(reqSkillCohortResource, {
            where: { id: resourceId },
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
    }
  };

  /**
   * Get resources released today
   */
  const getResourcesToBeReleasedToday = async () => {
    const dateToday = moment().tz("America/Los_Angeles").format("YYYY-MM-DD");

    return await SkillCohortResources.findAll({
      where: {
        releaseDate: dateToday,
      },
    });
  };

  /**
   * Get yesterday's released resource by id's
   */
  const getYesterdayResourcesByCohortIds = async () => {
    const yesterdayDate = moment()
      .tz("America/Los_Angeles")
      .startOf("day")
      .subtract(1, "day")
      .format("YYYY-MM-DD HH:mm:ssZ");
    const dateToday = moment()
      .tz("America/Los_Angeles")
      .startOf("day")
      .format("YYYY-MM-DD HH:mm:ssZ");

    const allResources = await SkillCohortResources.findAll({
      where: {
        releaseDate: yesterdayDate,
      },
      include: {
        model: SkillCohort,
        where: {
          startDate: {
            [Op.lte]: dateToday,
          },
          endDate: {
            [Op.gte]: dateToday,
          },
        },
      },
      raw: true,
      nest: true,
    });

    return allResources;
  };

  return {
    create,
    getAll,
    get,
    remove,
    update,
    getResourcesToBeReleasedToday,
    getYesterdayResourcesByCohortIds,
  };
};

module.exports = SkillCohortResourcesController;
