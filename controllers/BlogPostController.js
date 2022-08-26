const db = require("../models");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");
const { Op } = require("sequelize");
const NotificationController = require("../controllers/NotificationController");
const sendInBlueService = require("../services/sendinblue.service");

const BlogPost = db.BlogPost;
const User = db.User;
const BlogPostLike = db.BlogPostLike;

const BlogPostController = () => {
  const create = async (req, res) => {
    const { body } = req;

    if (body.title && body.description && body.categories) {
      try {
        if (body.imageUrl) {
          body.imageUrl = await s3Service().getBlogPostImageUrl(
            "",
            body.imageUrl
          );
        }

        const newBlogPost = await BlogPost.create({
          ...body,
          status: body.status ? body.status : "published",
        });

        if (!newBlogPost) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        await NotificationController().createNotification({
          message: `New Blog "${newBlogPost.title}" was created.`,
          type: "Blog",
          meta: {
            ...newBlogPost,
          },
          onlyFor: [-1],
        });

        return res.status(HttpCodes.OK).json({ blogPost: newBlogPost });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Title and Description are needed." });
  };

  const search = async (req, res) => {
    const { page = 1, category = [] } = req.query;

    let categoryParsed = category.length > 0 ? JSON.parse(category) : category;
    let where = {};

    if (categoryParsed.length > 0) {
      where = {
        categories: {
          [Op.overlap]: categoryParsed,
        },
      };
    }

    try {
      const count = await BlogPost.count({
        where,
      });

      const blogsPosts = await BlogPost.findAll({
        where,
        order: [["createdAt", "DESC"]],
        limit: 20,
        offset: (page - 1) * 20,
      });

      return res.status(HttpCodes.OK).json({ blogsPosts, count });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getByChannelId = async (req, res) => {
    const { ChannelId } = req.params;
    try {
      const blogsPostByChannel = await BlogPost.findAll({
        where: {
          ChannelId,
        },
        order: [["createdAt", "DESC"]],
      });

      return res.status(HttpCodes.OK).json({ blogsPostByChannel });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getBlogPost = async (req, res) => {
    const { blogPostId } = req.params;
    try {
      const blogPost = await BlogPost.findOne({
        where: {
          id: blogPostId,
        },
        include: [
          {
            model: User,
            attributes: ["id", "firstName", "lastName", "img"],
          },
          {
            model: BlogPostLike,
          },
        ],
      });

      if (blogPost) {
        return res.status(HttpCodes.OK).json({ blogPost });
      }

      return res
        .status(HttpCodes.BAD_GATEWAY)
        .json({ msg: "BlogPost not found" });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getBlogPostsOfLastWeek = async (req, res) => {
    try {
      const blogsPost = await BlogPost.findAll({
        where: {
          send: false,
        },
        include: [
          {
            model: User,
            attributes: ["id", "firstName", "lastName", "img"],
          },
        ],

        attributes: ["id", "title", "summary", "createdAt"],
      });

      if (blogsPost.length > 5) {
        await BlogPost.update(
          {
            send: true,
          },
          {
            where: { send: false },
          }
        );
      }

      return blogsPost;
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Something went wrong" });
    }
  };

  const update = async (req, res) => {
    const { body, params } = req;
    try {
      if (body.imageUrl) {
        body.imageUrl = await s3Service().getBlogPostImageUrl(
          "",
          body.imageUrl
        );
      }

      const [numberOfAffectedRows, affectedRows] = await BlogPost.update(
        { ...body },
        {
          where: {
            id: params.blogPostId,
          },
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
    const { blogPostId } = req.params;

    if (blogPostId) {
      try {
        await BlogPost.destroy({
          where: {
            id: blogPostId,
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

  return {
    create,
    search,
    getByChannelId,
    getBlogPost,
    getBlogPostsOfLastWeek,
    update,
    remove,
  };
};

module.exports = BlogPostController;
