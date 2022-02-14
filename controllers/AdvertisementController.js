const db = require("../models");
const moment = require("moment-timezone");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");

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
    const dateToday = moment()
      .tz("America/Los_Angeles")
      .startOf("day")
      .format("YYYY-MM-DD HH:mm:ssZ");

    try {
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
  };

  const createAdvertisement = async (req, res) => {
    const data = req.body;
    const { id } = req.user;
    // check if user is an advertiser

    try {
      const startDate = moment
        .tz(data.startdate, "America/Los_Angeles")
        .startOf("day");

      const endDate = moment
        .tz(data.endDate, "America/Los_Angeles")
        .startOf("day");

      const transformedData = {
        ...data,
        UserId: id,
        startDate,
        endDate,
        datesBetweenStartDateAndEndDate: [],
      };

      const diff = endDate.diff(startDate, "days");
      transformedData["adDurationByDays"] = diff + 1;

      for (i = 1; i < diff; i++) {
        const date = startDate.add(i, "days").format("YYYY-MM-DD HH:mm:ssZ");

        transformedData.datesBetweenStartDateAndEndDate.push(date);
      }

      let adPrice = price.find((p) => p.min <= diff && p.max >= diff);

      if (adPrice) {
        transformedData["adTotalCost"] = adPrice.price * (diff + 1);
      }

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
