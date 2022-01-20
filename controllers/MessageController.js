const db = require("../models");
const HttpCodes = require("http-codes");
const socketService = require("../services/socket.service");
const SocketEventTypes = require("../enum/SocketEventTypes");
const Message = db.Message;

const MessageController = () => {
  const create = async (message) => {
    try {
      const newMessage = await Message.create(message);
      return newMessage;
    } catch (error) {
      // res
      //   .status(HttpCodes.INTERNAL_SERVER_ERROR)
      //   .json({ msg: "Internal server error" });
      console.log(error);
    }
  };

  const getAll = async (req, res) => {
    const { ConversationId } = req.params;

    try {
      const messages = await Message.findAll({
        where: {
          ConversationId,
        },
      });

      return res.status(HttpCodes.OK).json({ messages });
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
  };
};

module.exports = MessageController;
