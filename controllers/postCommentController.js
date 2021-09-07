const db = require("../models");
const HttpCodes = require("http-codes");

const PostComment = db.PostComment;
const User = db.User;

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

  /**
   * Method to get comments bu post
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
     const filter = req.query;
     try {
       let where = {};
      
       if (filter.postId) {
        where = {
          ...where,
          PostId: filter.postId
        };
      }

       let comments = await PostComment.findAndCountAll({
         where,
         offset: (filter.page - 1) * filter.num,
         limit: filter.num,
         order: [["createdAt", "DESC"]],
         include: User,
       });
       if (!comments) {
         return res
           .status(HttpCodes.INTERNAL_SERVER_ERROR)
           .json({ msg: "Internal server error" });
       }
 
       return res.status(HttpCodes.OK).json({ comments });
     } catch (error) {
       console.log(error);
       return res
         .status(HttpCodes.INTERNAL_SERVER_ERROR)
         .json({ msg: "Internal server error" });
     }
  };

  return {
    add,
    getAll,
  };
};

module.exports = PostCommentController;
