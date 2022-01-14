const db = require("../models");
const HttpCodes = require("http-codes");
const { Op } = require("sequelize");
const socketService = require("../services/socket.service");
const SocketEventTypes = require("../enum/SocketEventTypes");
const Conversation = db.Conversation;

const ConversationController = () => {
  const create = async (req, res) => {
    const { members } = req.body;
    try {
      const prevConversation = await Conversation.findOne({
        where: {
          members: {
            [Op.overlap]: members,
          },
        },
      });
      if (prevConversation) return;
      const conversation = await Conversation.create({ members });
      return res.status(HttpCodes.OK).json({ conversation });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal Server Error" });
    }
  };

  const getAll = async (req, res) => {
    const { userId } = req.params;
    try {
      const conversations = await Conversation.findAll({
        where: {
          members: {
            [Op.overlap]: [userId],
          },
        },
      });
      socketService().emit(SocketEventTypes.CONVERSATIONS, conversations);
      return res.status(HttpCodes.OK).json({ conversations });
    } catch (error) {
      res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server Error",
      });
      console.log(error);
    }
  };

  const get = async (req, res) => {
    const { id } = req.params;
    try {
      const conversations = await Conversation.findOne({
        where: {
          id,
        },
      });

      return res.status(HttpCodes.OK).json({ conversations });
    } catch (error) {
      res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server Error",
      });
      console.log(error);
    }
  };

  return {
    create,
    getAll,
    get,
  };
};

module.exports = ConversationController;
