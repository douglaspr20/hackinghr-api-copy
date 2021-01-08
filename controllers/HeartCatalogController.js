const db = require("../models");
const HttpCodes = require("http-codes");

const HeartCatalog = db.HeartCatalog;

const HeartCatalogController = () => {
  /**
   * Method to get all Heart objects
   * @param {*} req 
  * @param {*} res 
  */
  const getAll = async (req, res) => {
    try {
      const heartCatalog = await HeartCatalog.findAll();
      if (!heartCatalog) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res
              .status(HttpCodes.OK)
              .json({ heartCatalog })
              .send();
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to get HeartCatalog object
   * @param {*} req 
   * @param {*} res 
   */
  const get = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        const heartCatalog = await HeartCatalog.findOne({
          where: {
            id,
          },
        });

        if (!heartCatalog) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res
                .status(HttpCodes.OK)
                .json({ heartCatalog })
                .send();
      } catch (error) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: user id is wrong" });
    }
  };
  /**
   * Method to add HeartCatalog object
   * @param {*} req 
   * @param {*} res 
   */
  const add = async (req, res) => {
    try {
      await HeartCatalog.create(req.body);

      return res
              .status(HttpCodes.OK)
              .send();
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to updated HeartCatalog object
   * @param {*} req 
   * @param {*} res 
   */
  const update = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        await HeartCatalog.update(req.body, {
          where: { id }
        })
        return res
                .status(HttpCodes.OK)
                .send();
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
   * Method to delete HeartCatalog object
   * @param {*} req 
   * @param {*} res 
   */
  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        await HeartCatalog.destroy({
          where: { id }
        })
        return res
                .status(HttpCodes.OK)
                .send();
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

module.exports = HeartCatalogController;
