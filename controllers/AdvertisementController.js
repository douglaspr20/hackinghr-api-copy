const db = require("../models");
const moment = require("moment-timezone");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");
const { Op } = require("sequelize");
const { isValidURL } = require("../utils/profile");

const Advertisement = db.Advertisement;

const price = [
  {
    min: 1,
    max: 10,
    price: 100,
  },
  {
    min: 10,
    max: 20,
    price: 200,
  },
  {
    min: 20,
    max: 30,
    price: 300,
  },
];

const AdvertisementController = () => {
  const getAdvertisementsTodayByPage = async (req, res) => {
    const { page } = req.query;

    const dateToday = moment().tz("America/Los_Angeles").startOf("day");

    try {
      const advertisement = await Advertisement.findAll({
        where: {
          startDate: {
            [Op.lte]: dateToday,
          },
          endDate: {
            [Op.gte]: dateToday,
          },
          page,
        },
      });

      return res.status(HttpCodes.OK).json({ advertisement });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const getAdvertisementByAdvertiser = async (req, res) => {
    const { UserId } = req.params;

    try {
      const advertisements = await Advertisement.findAll({
        where: {
          UserId,
        },
        order: [["createdAt", "ASC"]],
      });

      return res.status(HttpCodes.OK).json({ advertisements });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const createAdvertisement = async (req, res) => {
    const data = req.body;
    const { id } = req.user;
    // check if user is an advertiser

    try {
      const transformedData = {
        ...data,
        UserId: id,
      };

      // const advertisementsCount = await Advertisement.count({
      //   where: {
      //     [Op.or]: [
      //       {
      //         datesBetweenStartDateAndEndDate: {
      //           [Op.contains]: [transformedData.startDate],
      //         },
      //       },
      //       {
      //         datesBetweenStartDateAndEndDate: {
      //           [Op.contains]: [transformedData.endDate],
      //         },
      //       },
      //     ],
      //     page: transformedData.page,
      //   },
      // });

      // if (advertisementsCount === 3 && data.page === "home") {
      //   return res.status(HttpCodes.BAD_REQUEST).json({ msg: "Already full" });
      // }

      const adBracket = price.find(
        (p) => p.min <= data.adDurationByDays && p.max >= data.adDurationByDays
      );
      transformedData["adCostPerDay"] = adBracket["price"] || 0;

      if (transformedData.image) {
        transformedData.adContentLink =
          await s3Service().getAdvertisementImageUrl("", transformedData.image);
      }

      const advertisement = await Advertisement.create(transformedData);

      // const advertisements = await Advertisement.findAll({
      //   where: {
      //     UserId: id,
      //   },
      //   order: [["createdAt", "ASC"]],
      // });

      return res.status(HttpCodes.OK).json({ advertisement });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const editAdvertisement = async (req, res) => {
    const _advertisement = req.body;
    const { AdvertisementId } = req.params;

    try {
      const advertisement = await Advertisement.findOne({
        where: {
          id: AdvertisementId,
        },
      });

      if (!advertisement) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Advertisement not found." });
      }

      if (_advertisement.image && !isValidURL(_advertisement.image)) {
        _advertisement.adContentLink =
          await s3Service().getAdvertisementImageUrl("", _advertisement.image);
      }

      const [numberOfAffectedRows, affectedRows] = await Advertisement.update(
        _advertisement,
        {
          where: {
            id: AdvertisementId,
          },
          returning: true,
          plain: true,
        }
      );

      return res
        .status(HttpCodes.OK)
        .json({ numberOfAffectedRows, affectedRows });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const getAllActiveAdvertisements = async (req, res) => {
    // const dateToday = moment().tz("America/Los_Angeles").startOf("day");

    try {
      const advertisements = await Advertisement.findAll();

      return res.status(HttpCodes.OK).json({ advertisements });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const getAdvertisementById = async (req, res) => {
    const { advertisementId } = req.params;

    try {
      const advertisement = await Advertisement.findOne({
        where: {
          id: advertisementId,
        },
      });

      if (!advertisement) {
        return res.status(HttpCodes.NOT_FOUND).json({
          msg: "Advertisement not found.",
          error,
        });
      }

      return res.status(HttpCodes.OK).json({ advertisement });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  return {
    getAdvertisementsTodayByPage,
    getAdvertisementByAdvertiser,
    createAdvertisement,
    getAdvertisementById,
    getAllActiveAdvertisements,
    editAdvertisement,
  };
};

module.exports = AdvertisementController;