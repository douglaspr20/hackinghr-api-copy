const db = require("../models");
const HttpCodes = require("http-codes");
const isEmpty = require("lodash/isEmpty");
const { Op } = require("sequelize");
const s3Service = require("../services/s3.service");

const { AWSConfig, Settings } = require("../enum");
const { S3 } = AWSConfig;

const Podcast = db.Podcast;
const VisibleLevel = Settings.VISIBLE_LEVEL;

const PodcastController = () => {
  /**
   * Method to get all Podcast objects
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    const filter = req.query;
    try {
      let where = {
        level: {
          [Op.or]: [VisibleLevel.DEFAULT, VisibleLevel.ALL],
        },
      };

      if (filter.topics && !isEmpty(JSON.parse(filter.topics))) {
        where = {
          ...where,
          topics: {
            [Op.overlap]: JSON.parse(filter.topics),
          },
        };
      }
      let podcast = await Podcast.findAll({
        where,
        order: [["order", "DESC"]],
      });
      if (!podcast) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res.status(HttpCodes.OK).json({ podcast });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to get Podcast object
   * @param {*} req
   * @param {*} res
   */
  const get = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        const podcast = await Podcast.findOne({
          where: {
            id,
          },
        });

        if (!podcast) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ podcast });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: data is wrong" });
    }
  };
  /**
   * Method to add Podcast object
   * @param {*} req
   * @param {*} res
   */
  const add = async (req, res) => {
    const { imageData } = req.body;
    try {
      let podcast = await Podcast.create({
        ...req.body,
        contentType: "podcast",
      });
      if (imageData) {
        let imageUrl = await s3Service().getPodcastImageUrl("", imageData);
        await Podcast.update(
          { imageUrl: imageUrl },
          {
            where: { id: podcast.id },
          }
        );
      }
      return res.status(HttpCodes.OK).send();
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to updated Podcast object
   * @param {*} req
   * @param {*} res
   */
  const update = async (req, res) => {
    const { id } = req.params;
    const { id: userId } = req.token;
    const { body } = req;

    if (id) {
      try {
        let data = {};
        let fields = [
          "title",
          "description",
          "order",
          "imageUrl",
          "dateEpisode",
          "vimeoLink",
          "anchorLink",
          "appleLink",
          "googleLink",
          "breakerLink",
          "pocketLink",
          "radioPublicLink",
          "spotifyLink",
          "iHeartRadioLink",
          "topics",
          "contentType",
        ];
        for (let item of fields) {
          if (body[item]) {
            data = { ...data, [item]: body[item] };
          }
        }
        if (body.imageData) {
          const podcast = await Podcast.findOne({
            where: {
              id,
            },
          });
          let imageUrl = await s3Service().getPodcastImageUrl(
            podcast.imageUrl || "",
            body.imageData
          );
          data = { ...data, imageUrl };
        }
        await Podcast.update(data, {
          where: { id },
        });
        return res.status(HttpCodes.OK).send();
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: data is wrong" });
    }
  };
  /**
   * Method to delete Podcast object
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        await Podcast.destroy({
          where: { id },
        });
        return res.status(HttpCodes.OK).send();
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: data is wrong" });
    }
  };

  const getChannelPodcasts = async (req, res) => {
    const filter = req.query;
    try {
      let where = {
        channel: filter.channel,
      };

      if (filter.topics && !isEmpty(JSON.parse(filter.topics))) {
        where = {
          ...where,
          topics: {
            [Op.overlap]: JSON.parse(filter.topics),
          },
        };
      }
      let podcasts = await Podcast.findAndCountAll({
        where,
        offset: (filter.page - 1) * filter.num,
        limit: filter.num,
        order: [["order", "DESC"]],
      });

      return res.status(HttpCodes.OK).json({ podcasts });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  return {
    getAll,
    get,
    add,
    update,
    remove,
    getChannelPodcasts,
  };
};

module.exports = PodcastController;
