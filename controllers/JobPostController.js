const db = require("../models");
const { generateKeywords } = require("../utils/string");
const { convertToCertainTime } = require("../utils/format");
const s3Service = require("../services/s3.service");
const { isEmpty, flattenDeep } = require("lodash");
const HttpCodes = require("http-codes");
const { Op } = require("sequelize");
const { isValidURL } = require("../utils/profile");

const JobPost = db.JobPost;

const JobPostController = () => {
  const getAll = async (req, res) => {
    const filter = req.query;

    try {
      let where = {
        status: "active",
      };

      if (filter?.level && !isEmpty(JSON.parse(filter.level))) {
        where = {
          ...where,
          level: {
            [Op.in]: JSON.parse(filter.level),
          },
        };
      }

      if (filter?.location && !isEmpty(JSON.parse(filter.location))) {
        where = {
          ...where,
          location: {
            [Op.overlap]: JSON.parse(filter.location),
          },
        };
      }

      if (filter?.keyword && !isEmpty(filter.keyword)) {
        const keyword = generateKeywords(filter.keyword);
        console.log(keyword, "keyword");
        where = {
          ...where,
          keywords: {
            [Op.overlap]: keyword,
          },
        };
      }

      const allJobPosts = await JobPost.findAndCountAll({
        where,
        offset: (filter.page - 1) * filter.num,
        limit: filter.num,
        order: [["createdAt", "DESC"]],
      });

      return res.status(HttpCodes.OK).json({ allJobPosts });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const getMyJobPosts = async (req, res) => {
    const { id } = req.user;
    const filter = req.query;

    try {
      let where = {
        UserId: id,
      };

      if (filter?.level && !isEmpty(JSON.parse(filter.level))) {
        where = {
          ...where,
          level: {
            [Op.in]: JSON.parse(filter.level),
          },
        };
      }

      if (filter?.location && !isEmpty(JSON.parse(filter.location))) {
        where = {
          ...where,
          location: {
            [Op.overlap]: JSON.parse(filter.location),
          },
        };
      }

      if (filter?.keyword && !isEmpty(filter.keyword)) {
        const keyword = generateKeywords(filter.keyword);
        where = {
          ...where,
          keywords: {
            [Op.overlap]: keyword,
          },
        };
      }

      const myJobPosts = await JobPost.findAll({
        where,
        order: [["createdAt", "DESC"]],
      });

      return res.status(HttpCodes.OK).json({ myJobPosts });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const upsert = async (req, res) => {
    const body = req.body;
    const { id } = req.user;

    try {
      let transformedData = {
        ...body,
        UserId: id,
        location: JSON.parse(body.location),
        preferredSkills: JSON.parse(body.preferredSkills),
        closingDate: convertToCertainTime(body.closingDate, body.timezone),
      };

      let fetchedJobPost = {};

      if (transformedData.id) {
        fetchedJobPost = await JobPost.findOne({
          where: {
            id: transformedData.id,
          },
        });
      }

      if (
        transformedData.companyLogo &&
        !isValidURL(transformedData.companyLogo)
      ) {
        transformedData.companyLogo = await s3Service().getJobPostImageUrl(
          "",
          transformedData.companyLogo
        );

        if (fetchedJobPost.companyLogo) {
          await s3Service().deleteUserPicture(fetchedJobPost.companyLogo);
        }
      }

      const titleKeywords = generateKeywords(transformedData.title);
      const companyNameKeywords = generateKeywords(transformedData.companyName);
      let keywords = [titleKeywords, companyNameKeywords];
      keywords = flattenDeep(keywords);

      transformedData = {
        ...transformedData,
        keywords,
      };

      await JobPost.upsert(transformedData, {
        returning: true,
      });

      const myJobPosts = await JobPost.findAll({
        where: {
          UserId: id,
        },
        order: [["createdAt", "DESC"]],
      });

      return res.status(HttpCodes.OK).json({ myJobPosts });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const getJobPost = async (req, res) => {
    const { JobPostId } = req.params;

    try {
      const jobPost = await JobPost.findOne({
        where: {
          id: JobPostId,
        },
      });

      if (!jobPost) {
        return res.status(HttpCodes.BAD_REQUEST).json({
          msg: "Bad Request",
          error,
        });
      }

      return res.status(HttpCodes.OK).json({ jobPost });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  return {
    getAll,
    upsert,
    getMyJobPosts,
    getJobPost,
  };
};

module.exports = JobPostController;
