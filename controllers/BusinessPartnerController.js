const db = require("../models");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");
const NotificationController = require("./NotificationController");

const BusinessPartner = db.BusinessPartner;
const BusinessDocument = db.BusinessPartnerDocument;
const User = db.User;

const BusinessPartnerController = () => {
  const getBusinessPartnerMembers = async (req, res) => {
    try {
      const businessPartnerMembers = await User.findAll({
        where: {
          isBusinessPartner: "accepted",
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

  const getBusinessPartnerDocuments = async (req, res) => {
    try {
      const businessPartnerDocuments = await BusinessDocument.findAll({
        include: User,
      });
      if (!businessPartnerDocuments) {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "There are not Documents" });
      }

      return res.status(HttpCodes.OK).json({ businessPartnerDocuments });
    } catch (error) {
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const createDocument = async (req, res, next) => {
    const { user } = req;
    const body = req.query;
    const { document } = req.files;
    let newBusinessPartnerDocument;
    if (body.title) {
      try {
        if (document) {
          const uploadFile = await s3Service().uploadResume(document, user);
          newBusinessPartnerDocument = await BusinessDocument.create({
            ...body,
            UserId: user.dataValues.id,
            documentFileName: document.name,
            documentFileUrl: uploadFile.Location,
          });
        }
        if (!newBusinessPartnerDocument) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        await NotificationController().createNotification({
          message: `New Business Partner Document"${
            newBusinessPartnerDocument.title || newBusinessPartnerDocument.title
          }" was created.`,
          type: "newBusinessPartnerDocument",
          meta: {
            ...newBusinessPartnerDocument,
          },
          onlyFor: [-1],
        });

        return res
          .status(HttpCodes.OK)
          .json({ businessPartnerDocument: newBusinessPartnerDocument });
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

  const uploadDocumentFile = async (req, res, next) => {
    const { user } = req;
    const body = req.query;
    try {
      const { document } = req.files || {};
      if (document) {
        const uploadFile = await s3Service().uploadResume(document, user);
        const [rows, updatedDocument] = await BusinessDocument.update(
          {
            documentFileName: document.name,
            documentFileUrl: uploadFile.Location,
          },
          {
            where: { id: body.documentId },
            returning: true,
            plain: true,
          }
        );
        res.status(HttpCodes.OK).json({ document: updatedDocument });
      }

      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "File not found!" });
    } catch (error) {
      next(error);
    }
  };

  const deleteDocumentFile = async (req, res, next) => {
    const { id } = req.params;
    try {
      const documentDeleted = await BusinessDocument.destroy({
        where: { id: id },
      });
      if (documentDeleted) {
        res.status(HttpCodes.OK).json({ msg: "File deleted successfully" });
      }
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "File not found!" });
    } catch (error) {
      next(error);
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
    getBusinessPartnerDocuments,
    getAll,
    createDocument,
    uploadDocumentFile,
    deleteDocumentFile,
    create,
  };
};

module.exports = BusinessPartnerController;
