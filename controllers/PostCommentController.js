const db = require("../models");
const { literal } = require("sequelize");
const HttpCodes = require("http-codes");
const NotificationController = require("../controllers/NotificationController");

const PostComment = db.PostComment;
const PostFollow = db.PostFollow;

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
      const postComment = await PostComment.create(data);

      const follow = await PostFollow.findAll({
        where: { PostId: data.PostId, UserId: req.user.id },
      });

      if (follow.length > 0) {
        await NotificationController().createNotification({
          message: `New Comment "${postComment.comment}" was created.`,
          type: "comment",
          meta: {
            ...postComment,
          },
          UserId: req.user.id,
        });
      }

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
      let where = { PostCommentId: null };

      if (filter.postId) {
        where = {
          ...where,
          PostId: filter.postId,
        };
      }

      let attributes = {
        include: [
          [
            literal(`(
                    SELECT UserFN."img"
                    FROM "Users" as UserFN
                    WHERE
                      UserFN.id = "PostComment"."UserId"
                )`),
            "userImg",
          ],
          [
            literal(`(
                    SELECT UserFN."firstName"
                    FROM "Users" as UserFN
                    WHERE
                      UserFN.id = "PostComment"."UserId"
                )`),
            "userFirstName",
          ],
          [
            literal(`(
                    SELECT UserFN."lastName"
                    FROM "Users" as UserFN
                    WHERE
                      UserFN.id = "PostComment"."UserId"
                )`),
            "userLastName",
          ],
        ],
      };

      let include = [
        {
          model: PostComment,
          attributes,
        },
      ];

      let comments = await PostComment.findAndCountAll({
        where,
        limit: filter.num,
        order: [["createdAt", "DESC"]],
        attributes,
        include,
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

  /**
   * Method to delete PostComment object
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        await PostComment.destroy({
          where: { PostCommentId: id },
        });
        await PostComment.destroy({
          where: { id },
        });
        return res.status(HttpCodes.OK).send();
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: data is wrong" });
    }
  };

  return {
    getAll,
    add,
    remove,
  };
};

module.exports = PostCommentController;
