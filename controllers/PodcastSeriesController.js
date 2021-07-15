const db = require("../models");
const HttpCodes = require("http-codes");
const isEmpty = require("lodash/isEmpty");
const { Op } = require("sequelize");
const { isValidURL } = require("../utils/profile");
const s3Service = require("../services/s3.service");
const smtpService = require("../services/smtp.service");
const { LabEmails } = require("../enum");

const PodcastSeries = db.PodcastSeries;
const Podcast = db.Podcast;

const PodcastSeriesController = () => {
  const create = async (req, res) => {
    const reqPodcastSeries = req.body;

    try {
      let podcastSeriesInfo = {
        ...reqPodcastSeries,
      };

      if (podcastSeriesInfo.img) {
        podcastSeriesInfo.img = await s3Service().getPodcastImageUrl(
          "",
          podcastSeriesInfo.img
        );
      }

      const podcastSeries = await PodcastSeries.create(podcastSeriesInfo);

      return res.status(HttpCodes.OK).json({ podcastSeries });
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

      const podcastSeries = await PodcastSeries.findAll({
        where,
        order: [["title"]],
      });

      return res.status(HttpCodes.OK).json({ podcastSeries });
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
        let podcastSeries = await PodcastSeries.findOne({
          where: {
            id,
          },
        });

        const podcasts = await Promise.all(
          podcastSeries.podcasts.map((item) => {
            return Podcast.findOne({
              where: {
                id: item,
              },
            });
          })
        );

        podcastSeries.podcasts = podcasts;

        if (!podcastSeries) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Bad Request: Podcast Series not found" });
        }

        return res.status(HttpCodes.OK).json({ podcastSeries });
      } catch (err) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: podcastseries id is wrong" });
  };

  const update = async (req, res) => {
    const { id } = req.params;
    const reqPodcastSeries = req.body;

    if (id) {
      try {
        let podcastSeriesInfo = {
          ...reqPodcastSeries,
        };

        const prevPodcastSeries = await PodcastSeries.findOne({
          where: {
            id,
          },
        });

        if (!prevPodcastSeries) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: Podcast Series not found." });
        }

        if (reqPodcastSeries.img && !isValidURL(reqPodcastSeries.img)) {
          podcastSeriesInfo.img = await s3Service().getPodcastImageUrl(
            "",
            reqPodcastSeries.img
          );

          if (prevPodcastSeries.img) {
            await s3Service().deleteUserPicture(prevPodcastSeries.img);
          }
        }

        if (prevPodcastSeries.img && !reqPodcastSeries.img) {
          await s3Service().deleteUserPicture(prevPodcastSeries.img);
        }

        const [numberOfAffectedRows, affectedRows] = await PodcastSeries.update(
          podcastSeriesInfo,
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
      .json({ msg: "Bad Request: Podcast Series id is wrong" });
  };

  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        await PodcastSeries.destroy({
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

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Podcast Series id is wrong" });
  };

  const claim = async (req, res) => {
    const { id } = req.body;
    const { user } = req;

    if (id) {
      try {
        let podcastSeries = await PodcastSeries.findOne({
          where: {
            id,
          },
        });

        let mailOptions = {
          from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
          to: user.email,
          subject: LabEmails.PODCAST_SERIES_CLAIM.subject(podcastSeries.title),
          html: LabEmails.PODCAST_SERIES_CLAIM.body(user, podcastSeries),
        };

        await smtpService().sendMail(mailOptions);

        return res.status(HttpCodes.OK).json({});
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }
    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Podcast Series id is wrong" });
  };

  return {
    create,
    getAll,
    get,
    update,
    remove,
    claim,
  };
};

module.exports = PodcastSeriesController;
