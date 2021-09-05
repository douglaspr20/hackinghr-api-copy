const db = require("../models");
const HttpCodes = require("http-codes");
const { Op } = require("sequelize");
const isEmpty = require("lodash/isEmpty");

const Bonfire = db.Bonfire;

const BonfireController = () => {
  const create = async (req, res) => {
    const reqBonfire = req.body;

    try {
      let bonfireInfo = {
        ...reqBonfire,
      };

      const bonfire = await Bonfire.create(bonfireInfo);

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
    let where = {};

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

  return {
    create,
    getAll,
    get,
    update,
    remove,
  };
};

module.exports = BonfireController;
