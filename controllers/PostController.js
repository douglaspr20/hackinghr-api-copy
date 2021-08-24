const db = require("../models");
const HttpCodes = require("http-codes");
const isEmpty = require("lodash/isEmpty");
const { Op } = require("sequelize");
const s3Service = require("../services/s3.service");
const { isValidURL } = require("../utils/profile");

const Post = db.Post;

const PostController = () => {
  /**
   * Method to get all Post objects
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    const filter = req.query;
    try {
      let where = {};
      let order = [];

      if (filter.topics && !isEmpty(JSON.parse(filter.topics))) {
        where = {
          ...where,
          topics: {
            [Op.overlap]: JSON.parse(filter.topics),
          },
        };
      }

      if (filter.meta) {
        where = {
          ...where,
          title: {
            [Op.iLike]: `%${filter.meta}%`,
          },
        };
      }

      if (filter.order) {
        order = [[JSON.parse(filter.order)[0], JSON.parse(filter.order)[1]]];
      }

      let posts = await Post.findAll({
        where,
        order,
      });

      if (!posts) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res.status(HttpCodes.OK).json({ posts });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  /**
   * Method to get Post object
   * @param {*} req
   * @param {*} res
   */
  const get = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        let post = await Post.findOne({
          where: {
            id,
          },
        });

        if (!post) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ post });
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
  /**
   * Method to add Post object
   * @param {*} req
   * @param {*} res
   */
  const add = async (req, res) => {
    const { imageData } = req.body;
    try {
      let data = { ...req.body };
      if(data.text){
        data.text = data.text.html;
      }
      data.UserId = req.user.id;
      let post = await Post.create(data);

      if (imageData) {
        let image = await s3Service().getPostImageUrl("", imageData);
        await Post.update({ image: image }, { where: { id: post.id } });
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
   * Method to update Post object
   * @param {*} req
   * @param {*} res
   */
  const update = async (req, res) => {
    const { id } = req.params;
    const { body } = req;

    if (id) {
      try {
        let data = {};
        let fields = ["text", "videoUrl", "topics", "UserId"];
        for (let item of fields) {
          if (body[item]) {
            data = { ...data, [item]: body[item] };
          }
        }

        const post = await Post.findOne({
          where: {
            id,
          },
        });

        if (!post) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: post not found." });
        }

        if (body.imageData && !isValidURL(body.imageData)) {
          data.imageUrl = await s3Service().getPostImageUrl("", body.imageData);

          if (post.imageUrl) {
            await s3Service().deleteUserPicture(post.imageUrl);
          }
        }

        if (post.imageUrl && !body.imageData) {
          await s3Service().deleteUserPicture(post.imageUrl);
          data.imageUrl = "";
        }

        await Post.update(data, {
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
  /**
   * Method to delete Post object
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        await Post.destroy({
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
    get,
    add,
    update,
    remove,
  };
};

module.exports = PostController;
