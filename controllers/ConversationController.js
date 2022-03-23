const db = require("../models");
const HttpCodes = require("http-codes");
const { Op, Sequelize } = require("sequelize");
const socketService = require("../services/socket.service");
const SocketEventTypes = require("../enum/SocketEventTypes");
const Conversation = db.Conversation;
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

      if (prevConversation) {
        return socketService().emit(
          SocketEventTypes.NEW_CONVERSATION,
          prevConversation.id
        );
      }
      const conversation = await Conversation.create({ members });
      socketService().emit(SocketEventTypes.NEW_CONVERSATION, conversation.id);
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
     public."Users".img, public."Users"."isOnline", public."Users"."firstName", public."Users"."lastName", public."Users"."timezone",
     public."Users"."isOnline", public."Messages".id as messageId, public."Messages".sender, public."Messages"."ConversationId", public."Messages".text,
     public."Messages"."updatedAt" as messageDate, public."Messages"."viewedUser" FROM public."Conversations"
     LEFT JOIN public."Users" ON public."Users".id = ANY (public."Conversations".members::int[])
     LEFT JOIN public."Messages" ON public."Messages"."ConversationId" = public."Conversations".id WHERE public."Conversations"."members" && ARRAY[${userId}]::int[]
     ORDER BY public."Messages"."updatedAt" DESC
     LIMIT 50
     `;

      const conversations = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      return res.status(HttpCodes.OK).json({ conversations });
    } catch (error) {
      res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server Error",
      });
      console.log(error);
    }
  };

  const get = async (req, res) => {
    const { conversationId } = req.params;

    try {
      const query = `
      SELECT public."Conversations".*, public."Users".id as userId, public."Users"."abbrName", public."Users"."email", 
      public."Users".img, public."Users"."isOnline", public."Users"."firstName", public."Users"."lastName", public."Users"."timezone",
      public."Users"."isOnline" FROM public."Conversations"
      LEFT JOIN public."Users" ON public."Users".id = ANY (public."Conversations".members::int[]) WHERE public."Conversations".id = ${conversationId}
      `;

      const conversation = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      return res.status(HttpCodes.OK).json({ conversation });
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
