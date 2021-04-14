const db = require("../models");
const HttpCodes = require("http-codes");
const { Op } = require("sequelize");
const s3Service = require("../services/s3.service");
const { isValidURL } = require("../utils/profile");
const { isEmpty } = require("lodash");
const SortOptions = require("../enum/FilterSettings").SORT_OPTIONS;
const Sequelize = require("sequelize");

const Channel = db.Channel;
const User = db.User;

const ChannelController = () => {
  const create = async (req, res) => {
    const { body } = req;
    const { id: userId } = req.token;

    if (body.name) {
      try {
        let channelInfo = {
          ...body,
          owner: userId,
        };

        // check channel name
        const existed = await Channel.findOne({
          where: {
            name: channelInfo.name,
          },
        });

        if (existed) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Channel name is existed. Please use another one." });
        }

        if (channelInfo.image) {
          channelInfo.image = await s3Service().getChannelImageUrl(
            "",
            channelInfo.image
          );
        }

        const newChannel = await Channel.create(channelInfo);

        await User.update(
          {
            channel: newChannel.id,
          },
          {
            where: { id: userId },
          }
        );
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
          include: {
            model: User,
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
    const params = req.query;

    try {
      let where = {};
      let order = [];

      if (params.category && !isEmpty(JSON.parse(params.category))) {
        where = {
          ...where,
          categories: {
            [Op.overlap]: JSON.parse(params.category),
          },
        };
      }

      switch (params.order) {
        case SortOptions["Newest first"]:
          order.push(["createdAt", "DESC"]);
          break;
        case SortOptions["Newest last"]:
          order.push(["createdAt", "ASC"]);
          break;
        case SortOptions["Sort by name"]:
          order.push(["name", "ASC"]);
          break;
        case SortOptions["Sort by type"]:
          order.push(["contentType", "ASC"]);
          break;
        default:
      }

      const channels = await Channel.findAndCountAll({
        where,
        offset: (params.page - 1) * params.num,
        limit: params.num,
        order,
      });

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

  const setFollow = async (req, res) => {
    const user = req.user;
    const { id } = req.params;

    try {
      await Channel.update(
        {
          followedUsers: Sequelize.fn(
            "array_append",
            Sequelize.col("followedUsers"),
            user.id
          ),
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );
      const channel = await Channel.findOne({
        where: {
          id,
        },
        include: {
          model: User,
        },
      });
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          followChannels: Sequelize.fn(
            "array_append",
            Sequelize.col("followChannels"),
            id
          ),
        },
        {
          where: { id: user.id },
          returning: true,
          plain: true,
        }
      );

      return res.status(HttpCodes.OK).json({ user: affectedRows, channel });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const unsetFollow = async (req, res) => {
    const user = req.user;
    const { id } = req.params;

    try {
      await Channel.update(
        {
          followedUsers: Sequelize.fn(
            "array_remove",
            Sequelize.col("followedUsers"),
            user.id
          ),
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );
      const channel = await Channel.findOne({
        where: {
          id,
        },
        include: {
          model: User,
        },
      });
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          followChannels: Sequelize.fn(
            "array_remove",
            Sequelize.col("followChannels"),
            id
          ),
        },
        {
          where: { id: user.id },
          returning: true,
          plain: true,
        }
      );

      return res.status(HttpCodes.OK).json({ user: affectedRows, channel });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  return {
    create,
    get,
    getAll,
    put,
    remove,
    setFollow,
    unsetFollow,
  };
};

module.exports = ChannelController;
