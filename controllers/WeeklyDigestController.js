const db = require("../models");
const { Op } = require("sequelize");
const s3Service = require("../services/s3.service");
const moment = require("moment-timezone");

const Podcast = db.Podcast;
const Library = db.Library;

const WeeklyDigestController = () => {
  const getPodcastByCreatorsThisWeek = async () => {
    const dateToday = moment()
      .tz("America/Los_Angeles")
      .startOf("day")
      .utc()
      .format("YYYY-MM-DD");

    const dateSevenDaysFromDateToday = moment()
      .tz("America/Los_Angeles")
      .startOf("day")
      .utc()
      .subtract(6, "day")
      .format("YYYY-MM-DD");

    try {
      const podcasts = await Podcast.findAll({
        where: {
          channel: {
            [Op.ne]: null,
          },
          [Op.and]: [
            {
              dateEpisode: {
                [Op.lte]: dateToday,
              },
            },
            {
              dateEpisode: {
                [Op.gte]: dateSevenDaysFromDateToday,
              },
            },
          ],
        },
        raw: true,
      });

      return podcasts;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const getResourcesByCreatorsThisWeek = async () => {
    try {
      const podcasts = await Podcast.findAll({
        where: {
          channel: {
            [Op.ne]: null,
          },
        },
        raw: true,
      });

      return podcasts;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  return {
    getPodcastByCreatorsThisWeek,
  };
};

module.exports = WeeklyDigestController;
