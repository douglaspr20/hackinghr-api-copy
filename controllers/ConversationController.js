const db = require("../models");
const HttpCodes = require("http-codes");
const { Op } = require("sequelize");
const socketService = require("../services/socket.service");
const SocketEventTypes = require("../enum/SocketEventTypes");
const { Sequelize } = require("../models");
const Conversation = db.Conversation;
const User = db.User;
const QueryTypes = Sequelize.QueryTypes;

const ConversationController = () => {
  const create = async (req, res) => {
    const { members } = req.body;
    try {
      const prevConversation = await Conversation.findOne({
        where: {
          members: {
            [Op.contains]: members,
          },
        },
      });

      if (prevConversation) return;
      const conversation = await Conversation.create({ members });
      return conversation;
    } catch (error) {
      console.log(error);
    }
  };

  const getAll = async (req, res) => {
    const { userId } = req.params;

    try {
      const query = `
     SELECT public."Conversations".*, public."Users".id as userId, public."Users"."abbrName", public."Users"."email", 
     public."Users".img, public."Users"."isOnline", public."Users"."firstName", public."Users"."lastName", public."Users"."timezone"
     FROM public."Conversations"
     LEFT JOIN public."Users" ON public."Users".id = ANY (public."Conversations".members::int[]) WHERE public."Conversations"."members" && ARRAY[${userId}]::int[]
     `;

      const conversations = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      // socketService().emit(SocketEventTypes.CONVERSATIONS, conversations);

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
