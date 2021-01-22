const db = require("../models");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");

const { AWSConfig } = require("../enum");
const { S3 } = AWSConfig;

const MarketPlace = db.MarketPlace;

const MarketPlaceController = () => {
  /**
   * Method to get all MarketPlace objects
   * @param {*} req 
   * @param {*} res 
   */
  const getAll = async (req, res) => {
    try {
      let marketPlace = await MarketPlace.findAll({
        order: [
          ['order', 'DESC'],
        ],
      });
      if (!marketPlace) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res
        .status(HttpCodes.OK)
        .json({ marketPlace });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to get MarketPlace object
   * @param {*} req 
   * @param {*} res 
   */
  const get = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        const marketPlace = await MarketPlace.findOne({
          where: {
            id,
          },
        });

        if (!marketPlace) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res
          .status(HttpCodes.OK)
          .json({ marketPlace });
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
   * Method to add MarketPlace object
   * @param {*} req 
   * @param {*} res 
   */
  const add = async (req, res) => {
    const { imageData } = req.body;
    try {
      let marketPlace = await MarketPlace.create(req.body);
      if (imageData) {
        let imageUrl = await s3Service().getMarketPlaceImageUrl('', imageData);
        await MarketPlace.update({ logoUrl: imageUrl }, {
          where: { id: marketPlace.id }
        })
      }
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
   * Method to updated MarketPlace object
   * @param {*} req 
   * @param {*} res 
   */
  const update = async (req, res) => {
    const { id } = req.params;
    const { id: userId } = req.token;
    const { body } = req

    if (id) {
      try {
        let data = {};
        let fields = [
          'name',
          'logoUrl',
          'description',
          'link',
          'categoryId',
          'contactInformation',
        ];
        for (let item of fields) {
          if (body[item]) {
            data = { ...data, [item]: body[item] };
          }
        }
        if (body.imageData) {
          const MarketPlace = await MarketPlace.findOne({
            where: {
              id,
            },
          });
          let imageUrl = await s3Service().getMarketPlaceImageUrl((MarketPlace.logoUrl || ''), body.imageData);
          data = { ...data, imageUrl }
        }
        await MarketPlace.update(data, {
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
   * Method to delete MarketPlace object
   * @param {*} req 
   * @param {*} res 
   */
  const remove = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        await MarketPlace.destroy({
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
    getAll,
    get,
    add,
    update,
    remove,
  };
};

module.exports = MarketPlaceController;