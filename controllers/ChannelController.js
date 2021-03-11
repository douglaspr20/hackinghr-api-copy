const db = require("../models");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");

const Channel = db.Channel;

const ChannelController = () => {
  const create = async (req, res) => {
    const { body } = req;

    if (body.name) {
      try {
        let channelInfo = {
          ...body,
        };

        if (channelInfo.image) {
          channelInfo.image = await s3Service().getChannelImageUrl(
            "",
            channelInfo.image
          );
        }

        const newChannel = await Channel.create(channelInfo);

        if (!newChannel) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ channel: newChannel });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error", error: error });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Channel Name is needed." });
  };

  const get = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        const channel = await Channel.findOne({
          where: {
            id,
          },
        });

        if (!channel) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Bad Request: Channel not found" });
        }

        return res.status(HttpCodes.OK).json({ channel });
      } catch (err) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Channel id is wrong" });
  };

  const getAll = async (req, res) => {
    try {
      const channels = await Channel.findAll({});

      return res.status(HttpCodes.OK).json({ channels });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const put = async (req, res) => {
    const { id } = req.params;
    const channel = req.body;

    try {
      let channelInfo = {
        ...channel,
      };

      const prevChannel = await Channel.findOne({
        where: {
          id,
        },
      });

      if (!prevChannel) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request: channel not found." });
      }

      if (channel.image && !isValidURL(channel.image)) {
        channelInfo.image = await s3Service().getChannelImageUrl(
          "",
          channel.image
        );

        if (prevChannel.image) {
          await s3Service().deleteUserPicture(prevChannel.image);
        }
      }

      if (prevChannel.image && !channel.image) {
        await s3Service().deleteUserPicture(prevChannel.image);
      }

      const [numberOfAffectedRows, affectedRows] = await Channel.update(
        channelInfo,
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
  };

  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        await Channel.destroy({
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
      .json({ msg: "Bad Request: channel id is wrong" });
  };

  return {
    create,
    get,
    getAll,
    put,
    remove,
  };
};

module.exports = ChannelController;
