const db = require("../models");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");
const { isValidURL } = require("../utils/profile");
const isEmpty = require("lodash/isEmpty");
const { Op } = require("sequelize");
const SortOptions = require("../enum/FilterSettings").SORT_OPTIONS;
const { ReviewStatus } = require("../enum");

const Library = db.Library;

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

        const newLibrary = await Library.create(libraryInfo);

        if (!newLibrary) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

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

      where = {
        ...where,
        approvalStatus: ReviewStatus.APPROVED,
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
  };
};

module.exports = LibraryController;
