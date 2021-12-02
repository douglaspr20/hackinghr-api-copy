const db = require("../models");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");
const NotificationController = require("./NotificationController");

const Partner = db.Partner;

const PartnerController = () => {
  /**
   * Method to get all MarketPlace objects
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    try {
      let partners = await Partner.findAll({});
      if (!partners) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res.status(HttpCodes.OK).json({ partners });
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
        const partner = await Partner.findOne({
          where: {
            id,
          },
        });

        if (!partner) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ partner });
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
    const { body } = req;

    if (body.name) {
      console.log(body);
      try {
        let newPartner = await Partner.create(body);
        if (body.logoUrl) {
          let imageUrl = await s3Service().getPartnerImageUrl("", logoUrl);
          await Partner.update(
            { logoUrl: imageUrl },
            {
              where: { id: newPartner.id },
            }
          );
          newPartner = {
            ...newPartner,
            id: newPartner.id,
            imageUrl,
          };
        }

        await NotificationController().createNotification({
          message: `New Company "${newPartner.name}" was created.`,
          type: "partner",
          meta: {
            ...newPartner,
          },
          onlyFor: [-1],
        });

        return res.status(HttpCodes.OK).send();
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
        0;
      }
    }
    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Name is needed." });
  };
  /**
   * Method to updated MarketPlace object
   * @param {*} req
   * @param {*} res
   */
  const update = async (req, res) => {
    const { id } = req.params;
    const { body } = req;

    if (id) {
      try {
        let data = {};
        let fields = [
          "name",
          "description",
          "url",
          "contact_name",
          "contact_email",
          "contact_phone",
          "contact_position",
          "topics",
          "demoUrl",
          "twitter",
          "facebook",
          "linkedin",
          "instagram",
          "isPartner",
        ];
        for (let item of fields) {
          if (body[item]) {
            data = { ...data, [item]: body[item] };
          }
        }
        if (body.logoUrl) {
          const partner = await Partner.findOne({
            where: {
              id,
            },
          });
          let imageUrl = await s3Service().getMarketplaceImageUrl(
            partner.logoUrl || "",
            body.logoUrl
          );
          data = { ...data, logoUrl: imageUrl };
        }
        await Partner.update(data, {
          where: { id },
        });
        return res.status(HttpCodes.OK).send();
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
        await Partner.destroy({
          where: { id },
        });
        return res.status(HttpCodes.OK).send();
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

module.exports = PartnerController;
