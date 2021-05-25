const db = require("../models");
const HttpCodes = require("http-codes");

const Live = db.Live;

const LiveController = () => {

  /**
   * Method to get Live object
   * @param {*} req
   * @param {*} res
   */
  const get = async (req, res) => {
    try {
      const live = await Live.findAll({
        limit: 1
      });

      if (live.length > 0) {
        return res.status(HttpCodes.OK).json({ live: live[0] });
      }else{
        return res.status(HttpCodes.OK).json({ live: {} });
      }
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to add Live object
   * @param {*} req 
   * @param {*} res 
   */
  const add = async (req, res) => {
    try {
      await Live.create({ ...req.body });

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
   * Method to update Live object
   * @param {*} req 
   * @param {*} res 
   */
  const update = async (req, res) => {
    const { id } = req.params;
    const { body } = req

    if (id) {
      try {
        let data = {};
        let fields = [
          "live",
          "url",
          "title",
          "description",
        ];
        for (let item of fields) {
          if (body[item]) {
            data = { ...data, [item]: body[item] };
          }
        }
        
        const live = await live.findOne({
          where: {
            id,
          },
        });
        if (!live) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: sponsor not found." });
        }

        await Live.update(data, {
          where: { id }
        });

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
    get,
    add,
    update,
  };
};

module.exports = LiveController;