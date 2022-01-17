const db = require("../models");
const { Op } = require("sequelize");
const s3Service = require("../services/s3.service");
const moment = require("moment-timezone");

const Podcast = db.Podcast;

const WeeklyDigestController = () => {
  const getPodcastByCreatorsThisWeek = async () => {
    try {
      const podcasts = await Podcast.findAll({
        where: {
          channel: {
            [Op.ne]: null,
          },
        },
      });
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
