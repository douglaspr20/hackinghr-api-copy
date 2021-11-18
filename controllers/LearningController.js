const db = require("../models");
const HttpCodes = require("http-codes");
const { isEmpty, flatten } = require("lodash");
const { Op } = require("sequelize");
const moment = require("moment-timezone");

const Podcast = db.Podcast;
const PodcastSeries = db.PodcastSeries;
const Library = db.Library;
const ConferenceLibrary = db.ConferenceLibrary;

const LearningController = () => {
  const getAllSaved = async (req, res) => {
    const { filter } = req.query;
    const user = req.user;

    let where = {
      saveForLater: {
        [Op.contains]: [user.id],
      },
    };

    let libraryWhere = {
      ...where,
    };

    try {
      if (filter && !isEmpty(JSON.parse(filter))) {
        libraryWhere = {
          ...where,
          categories: {
            [Op.overlap]: JSON.parse(filter),
          },
        };
      }

      const allLibraries = await Library.findAll({
        where: {
          ...libraryWhere,
        },
        order: [["updatedAt", "DESC"]],
        raw: true,
      });

      const allConferenceLibraries = await ConferenceLibrary.findAll({
        where: {
          ...libraryWhere,
        },
        order: [["updatedAt", "DESC"]],
        raw: true,
      });

      const allPodcasts = await Podcast.findAll({
        where,
        order: [["updatedAt", "DESC"]],
        raw: true,
      });

      const allPodcastSeries = await PodcastSeries.findAll({
        where,
        order: [["updatedAt", "DESC"]],
        raw: true,
      });

      const allSaved = {
        allLibraries,
        allConferenceLibraries,
        allPodcasts,
        allPodcastSeries,
      };

      return res.status(HttpCodes.OK).json({ allSaved });
    } catch (error) {
      console.error(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };

  const getAllCompleted = async (req, res) => {
    const { filter } = req.query;
    const user = req.user;

    let where = {
      viewed: {
        [Op.contains]: {
          [user.id]: "mark",
        },
      },
    };

    let libraryWhere = {
      ...where,
    };

    try {
      if (filter && !isEmpty(JSON.parse(filter))) {
        libraryWhere = {
          ...where,
          categories: {
            [Op.overlap]: JSON.parse(filter),
          },
        };
      }

      const allLibraries = await Library.findAll({
        where: {
          ...libraryWhere,
        },
        order: [["updatedAt", "DESC"]],
        raw: true,
      });

      const allConferenceLibraries = await ConferenceLibrary.findAll({
        where: {
          ...libraryWhere,
        },
        order: [["updatedAt", "DESC"]],
        raw: true,
      });

      const allPodcasts = await Podcast.findAll({
        where,
        order: [["updatedAt", "DESC"]],
        raw: true,
      });

      const allPodcastSeries = await PodcastSeries.findAll({
        where,
        order: [["updatedAt", "DESC"]],
        raw: true,
      });

      const allCompleted = {
        allLibraries,
        allConferenceLibraries,
        allPodcasts,
        allPodcastSeries,
      };

      return res.status(HttpCodes.OK).json({ allCompleted });
    } catch (error) {
      console.error(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };

  const getAllItemsWithHrCredit = async (req, res) => {
    const query = req.query;

    try {
      let where = {};
      let where2 = {};

      if (query.category && !isEmpty(JSON.parse(query.category))) {
        where2 = {
          ...where,
          categories: {
            [Op.overlap]: JSON.parse(query.category),
          },
        };
      }

      if (query.meta) {
        where = {
          ...where,
          meta: {
            [Op.iLike]: `%${query.meta}%`,
          },
        };
      }

      const num = query.num / 3;

      const data = [];

      let conferences = ConferenceLibrary.findAndCountAll({
        where: {
          ...where2,
          showClaim: 1,
        },
        offset: (query.page - 1) * num,
        limit: num,
        order: [["createdAt", "DESC"]],
        raw: true,
      });

      let libraries = Library.findAndCountAll({
        where: {
          ...where,
          showClaim: 1,
        },
        offset: (query.page - 1) * num,
        limit: num,
        order: [["createdAt", "DESC"]],
        raw: true,
      });

      let podcastSeries = PodcastSeries.findAndCountAll({
        where2,
        offset: (query.page - 1) * num,
        limit: num,
        order: [["createdAt", "DESC"]],
        raw: true,
      });

      data.push(conferences);
      data.push(libraries);
      data.push(podcastSeries);

      const itemsWithHRCreditsData = await Promise.all(data);

      const count = itemsWithHRCreditsData.reduce((a, b) => {
        return a + b.count;
      }, 0);

      const items = itemsWithHRCreditsData.map((items, index) => {
        return items.rows.map((item) => {
          let type;
          if (index === 0) {
            type = "conferences";
          } else if (index === 1) {
            type = "libraries";
          } else {
            type = "podcastSeries";
          }

          return {
            ...item,
            type,
          };
        });
      });

      let itemsWithHRCredits = {
        count,
        rows: items,
      };

      itemsWithHRCredits.rows = flatten(itemsWithHRCredits.rows);

      itemsWithHRCredits.rows = itemsWithHRCredits.rows.sort((a, b) => {
        if (moment(a.createdAt) < moment(b.createdAt)) {
          return -1;
        } else if (moment(b.createdAt) < moment(a.createdAt)) {
          return 1;
        } else {
          return 0;
        }
      });

      return res.status(HttpCodes.OK).json({ itemsWithHRCredits });
    } catch (error) {
      console.error(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };

  return {
    getAllSaved,
    getAllCompleted,
    getAllItemsWithHrCredit,
  };
};

module.exports = LearningController;
