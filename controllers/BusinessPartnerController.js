const db = require("../models");
const HttpCodes = require("http-codes");
const NotificationController = require("./NotificationController");

const BusinessPartner = db.BusinessPartner;
const User = db.User;

const BusinessPartnerController = () => {
  const getBusinessPartnerMembers = async (req, res) => {
    try {
      const businessPartnerMembers = await User.findAll({
        where: {
          isBusinessPartner: true,
        },
      });
      if (!businessPartnerMembers) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "There are not business Partner Members" });
      }

      return res.status(HttpCodes.OK).json({ businessPartnerMembers });
    } catch (error) {
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getBusinessPartnerResource = async (req, res) => {
    const { id } = req.params;
    try {
      const businessResource = await BusinessPartner.findOne({
        where: {
          id,
        },
      });

      if (!businessResource) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request: channel not found." });
      }

      return res.status(HttpCodes.OK).json({ businessResource });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getAll = async (req, res) => {
    try {
      const businessResources = await BusinessPartner.findAll();

      if (!businessResources) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "There are not Business Partner member" });
      }

      return res.status(HttpCodes.OK).json({ businessResources });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const create = async (req, res) => {
    const { body } = req;
    if (body.title) {
      try {
        let businessInfo = {
          ...body,
          link: body.link ? `https://${body.link}` : "",
        };

        const newBusinessPartner = await BusinessPartner.create(businessInfo);

        if (!newBusinessPartner) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        await NotificationController().createNotification({
          message: `New Business Partner "${
            newBusinessPartner.title || newBusinessPartner.title
          }" was created.`,
          type: "BusinessPartner",
          meta: {
            ...newBusinessPartner,
          },
          onlyFor: [-1],
        });

        return res
          .status(HttpCodes.OK)
          .json({ businessPartner: newBusinessPartner });
      } catch (error) {
        console.log(error);
        res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error", error: error });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Title is needed." });
  };

  return {
    getBusinessPartnerMembers,
    getBusinessPartnerResource,
    getAll,
    create,
  };
};

module.exports = BusinessPartnerController;
