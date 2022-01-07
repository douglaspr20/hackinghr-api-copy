const db = require("../models");
const s3Service = require("../services/s3.service");
const { isEmpty } = require("lodash");
const HttpCodes = require("http-codes");
const { Op } = require("sequelize");
const { isValidURL } = require("../utils/profile");
const moment = require("moment-timezone");
const { LabEmails } = require("../enum");
const smtpService = require("../services/smtp.service");

const JobPost = db.JobPost;
const User = db.User;

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
        where = {
          ...where,
          [Op.or]: [
            {
              jobTitle: {
                [Op.like]: `%${filter.keyword}%`,
              },
            },
            {
              companyName: {
                [Op.like]: `%${filter.keyword}%`,
              },
            },
          ],
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
        where = {
          ...where,
          [Op.or]: [
            {
              jobTitle: {
                [Op.like]: `%${filter.keyword}%`,
              },
            },
            {
              companyName: {
                [Op.like]: `%${filter.keyword}%`,
              },
            },
          ],
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
        mainJobFunctions: JSON.parse(body.mainJobFunctions),
        preferredSkills: JSON.parse(body.preferredSkills),
        closingDate: moment(body.closingDate).format("YYYY-MM-DD HH:mm:ssZ"),
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
        include: {
          model: db.User,
          attributes: [
            "id",
            "personalLinks",
            "img",
            "firstName",
            "lastName",
            "titleProfessions",
          ],
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

  const invitationToApply = async (req, res) => {
    const { UserId, JobPostId } = req.body;

    try {
      const user = await User.findOne({
        where: {
          id: UserId,
        },
      });

      if (!user) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request", error });
      }

      const jobPost = await JobPost.findOne({
        where: {
          id: JobPostId,
        },
      });

      if (!jobPost) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request", error });
      }

      const mailOptions = {
        from: process.env.SEND_IN_BLUE_SMTP_SENDER,
        to: user.email,
        subject: LabEmails.JOB_POST_INVITATION_TO_APPLY.subject(),
        html: LabEmails.JOB_POST_INVITATION_TO_APPLY.body(user),
        contentType: "text/html",
      };

      await smtpService().sendMailUsingSendInBlue(mailOptions);

      return res.status(HttpCodes.OK).json();
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  const jobPostAutoExpiry = async () => {
    const dateToday = moment().endOf("day").format("YYYY-MM-DD HH:mm:ssZ");

    try {
      const jobPosts = await JobPost.findAll({
        where: {
          closingDate: {
            [Op.lt]: dateToday,
          },
          status: {
            [Op.and]: [
              {
                [Op.ne]: "expired",
              },
              {
                [Op.ne]: "closed",
              },
            ],
          },
        },
      });

      const jobPostIds = jobPosts.map((post) => {
        return post.id;
      });

      await JobPost.update(
        { status: "expired" },
        {
          where: {
            id: jobPostIds,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  return {
    getAll,
    upsert,
    getMyJobPosts,
    getJobPost,
    invitationToApply,
    jobPostAutoExpiry,
  };
};

module.exports = JobPostController;
