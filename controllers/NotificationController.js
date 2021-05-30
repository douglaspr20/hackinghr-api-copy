const db = require("../models");
const HttpCodes = require("http-codes");
const Sequelize = require("sequelize");
const socketService = require("../services/socket.service");
const SocketEventType = require("../enum/SocketEventTypes");

const Notification = db.Notification;
const Op = Sequelize.Op;

const MAX_NUMBER_OF_NOTIFICATION = 1000;

const NotificationController = () => {
  const create = async (req, res) => {
    const { body } = req;

    if (body.message) {
      try {
        const newNotification = await createNotification(body);
        return res.status(HttpCodes.OK).json({ notification: newNotification });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error", error: error });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Message is needed." });
  };

  const getAll = async (req, res) => {
    const { num, page } = req.query;
    const { user } = req;

    try {
      const notifications = await Notification.findAndCountAll({
        offset: (page - 1) * num,
        limit: num,
        order: [["createdAt", "DESC"]],
      });

      const readCount = await Notification.count({
        where: {
          readers: {
            [Op.contains]: [user.id],
          },
        },
      });

      if (!notifications) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Bad Request: Notifications not found" });
      }

      return res.status(HttpCodes.OK).json({ notifications, readCount });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const get = async (req, res) => {
    const { id } = req.params;

    try {
      const notification = await Notification.findOne({
        where: {
          id,
        },
      });

      if (!notification) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Bad Request: Notification not found" });
      }

      return res.status(HttpCodes.OK).json({ notification });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const update = async (req, res) => {
    const { id } = req.params;
    const notification = req.body;

    try {
      let notificationInfo = {
        ...notification,
      };

      const prevNotification = await Notification.findOne({
        where: {
          id,
        },
      });

      if (!prevNotification) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request: Notification not found." });
      }

      const [numberOfAffectedRows, affectedRows] = await Notification.update(
        notificationInfo,
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
        await Notification.destroy({
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
      .json({ msg: "Bad Request: id is wrong" });
  };

  const createNotification = async (notification) => {
    const newNotification = await Notification.create(notification);

    const totalCount = await Notification.count();

    if (totalCount > MAX_NUMBER_OF_NOTIFICATION) {
      const lastElement = await Notification.findAll({
        offset: 0,
        limit: 1,
        order: ["createdAt", "ASC"],
      });
      await lastElement.destroy();
    }

    socketService().emit(SocketEventType.NEW_EVENT, newNotification);

    return newNotification;
  };

  const setNotificationsRead = async (req, res) => {
    const { notifications } = req.body;
    const { user } = req;

    try {
      await Notification.update(
        {
          readers: Sequelize.fn(
            "array_append",
            Sequelize.col("readers"),
            user.id
          ),
        },
        {
          where: {
            id: {
              [Op.in]: notifications,
            },
          },
        }
      );

      const totalCount = await Notification.count();

      const readCount = await Notification.count({
        where: {
          readers: {
            [Op.contains]: [user.id],
          },
        },
      });

      return res.status(HttpCodes.OK).json({ unread: totalCount - readCount });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  return {
    create,
    getAll,
    get,
    update,
    remove,
    createNotification,
    setNotificationsRead,
  };
};

module.exports = NotificationController;
