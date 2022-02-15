const db = require("../models");
const moment = require("moment-timezone");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");
const { Op } = require("sequelize");

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
  const getAdvertisementsByPage = async (req, res) => {
    const { page } = req.query;

    const dateToday = moment().tz("America/Los_Angeles").startOf("day");

    try {
      const advertisement = await Advertisement.findOne({
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

      console.log(advertisement, "advertisements");
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

      const adBracket = price.find(
        (p) => p.min <= data.adDurationByDays && p.max >= data.adDurationByDays
      );
      transformedData["adCostPerDay"] = adBracket["price"] || 0;

      if (transformedData.image) {
        transformedData.advertisementLink =
          await s3Service().getAdvertisementImageUrl("", transformedData.image);
      }

      const advertisement = await Advertisement.create(transformedData);

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
    getAdvertisementsByPage,
    getAdvertisementByAdvertiser,
    createAdvertisement,
  };
};

module.exports = AdvertisementController;
