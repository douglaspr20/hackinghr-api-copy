const db = require("../models");
const HttpCodes = require("http-codes");
const { literal, Op, fn } = require("sequelize");
const SortOptions = require("../enum/FilterSettings").SORT_OPTIONS;

const Library = db.Library;
const Podcast = db.Podcast;
const Event = db.Event;
const ConferenceLibrary = db.ConferenceLibrary;

const HomeController = () => {
  const getRecommendations = async (req, res) => {
    try {
      const libraries = await Library.findAll({
        where: {
          approvalStatus: 'approved',
        },
        order: [
          [fn('RANDOM')]
        ],
        limit: 3,
      });

      const podcasts = await Podcast.findAll({
        order: [
          [fn('RANDOM')]
        ],
        limit: 3,
      });

      const events = await Event.findAll({
        where: {
          startDate: {
            [Op.gte]: new Date(),
          }

        },
        order: [
          [fn('RANDOM')]
        ],
        limit: 3,
      });

      const conferenceLibrary = await ConferenceLibrary.findAll({
        order: [
          [fn('RANDOM')]
        ],
        limit: 3,
      });

      if (!libraries) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Bad Request: Recommendations not found" });
      }

      return res.status(HttpCodes.OK).json({
        libraries,
        podcasts,
        events,
        conferenceLibrary,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  return {
    getRecommendations,
  };
};

module.exports = HomeController;