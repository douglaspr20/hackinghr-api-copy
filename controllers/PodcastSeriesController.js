const db = require("../models");
const HttpCodes = require("http-codes");

const PodcastSeries = db.PodcastSeries;

const PodcastSeriesController = () => {
  const create = async (req, res) => {
    const podcastSeriesInfo = req.body;

    try {
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
    try {
      const podcastSeries = await PodcastSeries.findAll({
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
        const podcastSeries = await PodcastSeries.findOne({
          where: {
            id,
          },
        });

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
    const podcastSeriesInfo = req.body;

    if (id) {
      try {
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

  return {
    create,
    getAll,
    get,
    update,
    remove,
  };
};

module.exports = PodcastSeriesController;
