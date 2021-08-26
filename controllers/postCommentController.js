const db = require("../models");
const HttpCodes = require("http-codes");

const PostComment = db.PostComment;

const PostCommentController = () => {
  /**
   * Method to add PostComment object
   * @param {*} req
   * @param {*} res
   */
  const add = async (req, res) => {
    try {
      let data = { ...req.body };
      data.UserId = req.user.id;
      await PostComment.create(data);

      return res.status(HttpCodes.OK).send();
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  
  return {
    add,
  };
};

module.exports = PostCommentController;
