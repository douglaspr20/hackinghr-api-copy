const db = require("../models");
const HttpCodes = require("http-codes");
const isEmpty = require("lodash/isEmpty");
const { Op } = require("sequelize");

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

  return {
    getAllSaved,
    getAllCompleted,
  };
};

module.exports = LearningController;
