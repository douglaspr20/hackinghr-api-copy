const db = require("../models");
const HttpCodes = require("http-codes");

const Heart = db.Heart;

const HeartController = () => {
  /**
   * Method to get all Heart objects
   * @param {*} req 
   * @param {*} res 
   */
  const getAll = async (req, res) => {
    try {
      let heart = await Heart.findAll({
        order: [
          ['createdAt', 'DESC'],
        ],
      });
      if (!heart) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      for(let index in heart){
        let childrenHeart = await Heart.findAll({
          where: { parentId: heart[index].id },
          order: [
            ['createdAt', 'DESC'],
          ],
        });
        heart[index].dataValues['responses'] = childrenHeart;
      }

      return res.status(HttpCodes.OK).json({ heart });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to get Heart object
   * @param {*} req 
   * @param {*} res 
   */
  const get = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        const heart = await Heart.findOne({
          where: {
            id,
          },
        });

        if (!heart) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ heart });
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
   * Method to add Heart object
   * @param {*} req 
   * @param {*} res 
   */
  const add = async (req, res) => {
    const {category, content, rate, parentId} = req.body
    try {
      await Heart.create({
        parentId,
        category,
        content,
        rate
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
  };
  /**
   * Method to updated Heart object
   * @param {*} req 
   * @param {*} res 
   */
  const update = async (req, res) => {
    let {id} = req.params;

    if (id) {
      try {
        await Heart.update(req.body,{
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
   * Method to delete Heart object
   * @param {*} req 
   * @param {*} res 
   */
  const remove = async (req, res) => {
    let {id} = req.params;

    if (id) {
      try {
        await Heart.destroy({
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

module.exports = HeartController;
