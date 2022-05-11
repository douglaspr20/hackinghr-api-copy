const db = require("../models");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");

const BlogPost = db.BlogPost;

const BlogPostController = () => {
  const create = async (req, res) => {
    const { body } = req;

    if (body.title && body.description) {
      try {
        if (body.imageUrl) {
          body.imageUrl = await s3Service().getChannelImageUrl(
            "",
            body.imageUrl
          );
        }

        const newBlogPost = await BlogPost.create({ ...body });

        if (!newBlogPost) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

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

  const getAll = async (req, res) => {
    try {
      const allBlogsPost = await BlogPost.findAll({
        order: [["createdAt", "DESC"]],
      });

      return res.status(HttpCodes.OK).json({ allBlogsPost });
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
        order: [["createdAt", "ASC"]],
      });

      return res.status(HttpCodes.OK).json({ blogsPostByChannel });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const update = async (req, res) => {
    const { body, params } = req;
    try {
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
    getAll,
    getByChannelId,
    update,
    remove,
  };
};

module.exports = BlogPostController;
