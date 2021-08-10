const db = require("../models");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");
const { isValidURL } = require("../utils/profile");
const isEmpty = require("lodash/isEmpty");
const { Op } = require("sequelize");
const SortOptions = require("../enum/FilterSettings").SORT_OPTIONS;
const { ReviewStatus, Settings } = require("../enum");
const NotificationController = require("../controllers/NotificationController");
const smtpService = require("../services/smtp.service");
const cryptoService = require("../services/crypto.service");
const { LabEmails } = require("../enum");

const Library = db.Library;
const VisibleLevel = Settings.VISIBLE_LEVEL;

const LibraryController = () => {
  const create = async (req, res) => {
    const { body } = req;

    if (body.title) {
      try {
        let libraryInfo = {
          ...body,
          link: body.link ? `https://${body.link}` : "",
        };

        if (libraryInfo.image) {
          libraryInfo.image = await s3Service().getLibraryImageUrl(
            "",
            libraryInfo.image
          );
        }

        if (libraryInfo.image2) {
          libraryInfo.image2 = await s3Service().getLibraryImageUrl(
            "",
            libraryInfo.image2
          );
        }

        const newLibrary = await Library.create(libraryInfo);

        if (!newLibrary) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        await NotificationController().createNotification({
          message: `New Content "${
            newLibrary.title || libraryInfo.title
          }" was created.`,
          type: "content",
          meta: {
            ...newLibrary,
          },
        });

        return res.status(HttpCodes.OK).json({ library: newLibrary });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error", error: error });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Title is needed." });
  };

  const share = async (req, res) => {
    const { body } = req;

    if (body.title) {
      try {
        let libraryInfo = {
          ...body,
          link: body.link ? `https://${body.link}` : "",
        };

        if (libraryInfo.image) {
          libraryInfo.image = await s3Service().getLibraryImageUrl(
            "",
            libraryInfo.image
          );
        }

        const newLibrary = await Library.create(libraryInfo);

        if (!newLibrary) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        // send email to admin user.

        return res.status(HttpCodes.OK).json({ library: newLibrary });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error", error: error });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Title is needed." });
  };

  const getAll = async (req, res) => {
    const filter = req.query;

    try {
      let where = {};

      if (filter.topics && !isEmpty(JSON.parse(filter.topics))) {
        where = {
          ...where,
          topics: {
            [Op.overlap]: JSON.parse(filter.topics),
          },
        };
      }

      if (
        filter["content type"] &&
        !isEmpty(JSON.parse(filter["content type"]))
      ) {
        where = {
          ...where,
          contentType: JSON.parse(filter["content type"]),
        };
      }

      if (filter.language && !isEmpty(JSON.parse(filter.language))) {
        where = {
          ...where,
          language: {
            [Op.overlap]: JSON.parse(filter.language),
          },
        };
      }

      const libraries = await Library.findAndCountAll({
        where,
      });

      return res.status(HttpCodes.OK).json({ libraries });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getApproved = async (req, res) => {
    const filter = req.query;

    try {
      let where = {};

      if (filter.topics && !isEmpty(JSON.parse(filter.topics))) {
        where = {
          ...where,
          topics: {
            [Op.overlap]: JSON.parse(filter.topics),
          },
        };
      }

      if (
        filter["content type"] &&
        !isEmpty(JSON.parse(filter["content type"]))
      ) {
        where = {
          ...where,
          contentType: JSON.parse(filter["content type"]),
        };
      }

      if (filter.language && !isEmpty(JSON.parse(filter.language))) {
        where = {
          ...where,
          language: {
            [Op.overlap]: JSON.parse(filter.language),
          },
        };
      }

      if (filter.meta) {
        where = {
          ...where,
          meta: {
            [Op.iLike]: `%${filter.meta}%`,
          },
        };
      }

      where = {
        ...where,
        approvalStatus: ReviewStatus.APPROVED,
        level: {
          [Op.or]: [VisibleLevel.DEFAULT, VisibleLevel.ALL],
        },
      };

      let order = [];

      switch (filter.order) {
        case SortOptions["Newest first"]:
          order.push(["createdAt", "DESC"]);
          break;
        case SortOptions["Newest last"]:
          order.push(["createdAt", "ASC"]);
          break;
        case SortOptions["Sort by name"]:
          order.push(["title", "ASC"]);
          break;
        case SortOptions["Sort by type"]:
          order.push(["contentType", "ASC"]);
          break;
        default:
      }

      const libraries = await Library.findAndCountAll({
        where,
        offset: (filter.page - 1) * filter.num,
        limit: filter.num,
        order,
      });

      return res.status(HttpCodes.OK).json({ libraries });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getChannelLibraries = async (req, res) => {
    const filter = req.query;

    try {
      let where = {
        channel: filter.channel,
        contentType: filter.contentType,
      };

      if (filter.topics && !isEmpty(JSON.parse(filter.topics))) {
        where = {
          ...where,
          topics: {
            [Op.overlap]: JSON.parse(filter.topics),
          },
        };
      }

      if (filter.language && !isEmpty(JSON.parse(filter.language))) {
        where = {
          ...where,
          language: {
            [Op.overlap]: JSON.parse(filter.language),
          },
        };
      }

      let order = [];

      switch (filter.order) {
        case SortOptions["Newest first"]:
          order.push(["createdAt", "DESC"]);
          break;
        case SortOptions["Newest last"]:
          order.push(["createdAt", "ASC"]);
          break;
        case SortOptions["Sort by name"]:
          order.push(["title", "ASC"]);
          break;
        case SortOptions["Sort by type"]:
          order.push(["contentType", "ASC"]);
          break;
        default:
      }

      const libraries = await Library.findAndCountAll({
        where,
        offset: (filter.page - 1) * filter.num,
        limit: filter.num,
        order,
      });

      return res.status(HttpCodes.OK).json({ libraries });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getLibrary = async (req, res) => {
    const { id } = req.params;

    try {
      const library = await Library.findOne({
        where: {
          id,
        },
      });

      if (!library) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Bad Request: Library not found" });
      }

      return res.status(HttpCodes.OK).json({ library });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getRecommendations = async (req, res) => {
    try {
      const libraries = await Library.findAll({
        where: {
          recommended: true,
        },
      });

      if (!libraries) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Bad Request: Recommendations not found" });
      }

      return res.status(HttpCodes.OK).json({ libraries });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const update = async (req, res) => {
    const { id } = req.params;
    const library = req.body;

    try {
      let libraryInfo = {
        ...library,
      };

      const prevLibrary = await Library.findOne({
        where: {
          id,
        },
      });

      if (!prevLibrary) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request: library not found." });
      }

      if (library.image && !isValidURL(library.image)) {
        libraryInfo.image = await s3Service().getLibraryImageUrl(
          "",
          library.image
        );

        if (prevLibrary.image) {
          await s3Service().deleteUserPicture(prevLibrary.image);
        }
      }

      if (prevLibrary.image && !library.image) {
        await s3Service().deleteUserPicture(prevLibrary.image);
      }

      // in case of recommend image
      if (library.image2 && !isValidURL(library.image2)) {
        libraryInfo.image2 = await s3Service().getLibraryImageUrl(
          "",
          library.image2
        );

        if (prevLibrary.image2) {
          await s3Service().deleteUserPicture(prevLibrary.image2);
        }
      }

      if (prevLibrary.image2 && !library.image2) {
        await s3Service().deleteUserPicture(prevLibrary.image2);
      }

      const [numberOfAffectedRows, affectedRows] = await Library.update(
        libraryInfo,
        {
          where: { id },
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

  const approve = async (req, res) => {
    const { id } = req.params;

    try {
      const [numberOfAffectedRows, affectedRows] = await Library.update(
        {
          approvalStatus: ReviewStatus.APPROVED,
        },
        {
          where: { id },
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

  const reject = async (req, res) => {
    const { id } = req.params;

    try {
      const [numberOfAffectedRows, affectedRows] = await Library.update(
        {
          approvalStatus: ReviewStatus.REJECTED,
        },
        {
          where: { id },
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

  const recommend = async (req, res) => {
    const { id } = req.params;
    const { recommend } = req.body;

    try {
      const [numberOfAffectedRows, affectedRows] = await Library.update(
        {
          recommended: recommend,
        },
        {
          where: { id },
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

  const deleteChannelLibrary = async (req, res) => {
    const { channel } = req.query;
    const { id } = req.params;

    if (req.user.channel != channel) {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: You are not allowed." });
    }

    try {
      await Library.destroy({
        where: {
          id,
        },
      });

      return res.status(HttpCodes.OK).json({});
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const claim = async (req, res) => {
    const { id } = req.body;
    const { user } = req;

    if (id) {
      try {
        let library = await Library.findOne({
          where: {
            id,
          },
        });

        library = {
          ...library,
          shrmCode: cryptoService().decrypt(library.shrmCode),
          hrciCode: cryptoService().decrypt(library.hrciCode),
        }

        if (library.showClaim === 1) {
          let mailOptions = {
            from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
            to: user.email,
            subject: LabEmails.LIBRARY_CLAIM.subject(library.title),
            html: LabEmails.LIBRARY_CLAIM.body(user, library),
          };

          await smtpService().sendMail(mailOptions);

          return res.status(HttpCodes.OK).json({});
        }

        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request: This library is not allowed to confirm" });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }
    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Library id is wrong" });
  };

  return {
    create,
    share,
    getAll,
    getLibrary,
    getRecommendations,
    update,
    approve,
    reject,
    recommend,
    getApproved,
    getChannelLibraries,
    deleteChannelLibrary,
    claim,
  };
};

module.exports = LibraryController;
