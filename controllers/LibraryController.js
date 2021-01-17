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
          libraryInfo.image = await s3Service().getEventImageUrl(
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

  return {
    create,
  };
};

module.exports = LibraryController;
