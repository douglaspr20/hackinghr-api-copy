const db = require("../models");
const HttpCodes = require("http-codes");
const Message = db.Message;

const MessageController = () => {
  const create = async (req, res) => {
    try {
      const message = await Message.create({ ...req.body });

      return res.status(HttpCodes.OK).json({ message });
    } catch (error) {
      res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
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
