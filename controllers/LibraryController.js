const db = require("../models");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");

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
          .json({ msg: "Internal server error", error: err });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Title is needed." });
  };

  const getAll = async (req, res) => {
    const filter = req.query;

    try {
      const libraries = await Library.findAndCountAll({
        offset: (filter.page - 1) * filter.num,
        limit: filter.num,
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

  return {
    create,
    getAll,
    getLibrary,
  };
};

module.exports = LibraryController;
