const db = require("../models");
const HttpCodes = require("http-codes");
const isEmpty = require("lodash/isEmpty");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");

const QueryTypes = Sequelize.QueryTypes;
const Journey = db.Journey;
const JourneyItems = db.JourneyItems;
const Library = db.Library;
const Podcast = db.Podcast;
const Event = db.Event;

const JourneyItemController = () => {
  /**
   * Method to get all journey objects
   * @param {*} req 
   * @param {*} res 
   */
  const getItemsByJourney = async (req, res) => {
    const { id } = req.params;
    
    try {
      const query = `
        SELECT * FROM (
          SELECT ji.*, l.title, l.description, l.link, l.image FROM "Libraries" l
          INNER JOIN "JourneyItems" ji ON l.id = ji."contentId"
          WHERE ji."JourneyId" = ${id}
          AND ji."contentType" IN ('article', 'video')
          UNION
          SELECT ji.*, p.title, p.description, p."appleLink" AS link, p."imageUrl" as image FROM "Podcasts" p
          INNER JOIN "JourneyItems" ji ON p.id = ji."contentId"
          WHERE ji."JourneyId" = ${id}
          AND ji."contentType" = 'podcast'
          UNION
          SELECT ji.*, e.title, CAST(e.description AS varchar) AS description, e.link, e.image FROM "Events" e
          INNER JOIN "JourneyItems" ji ON e.id = ji."contentId"
          WHERE ji."JourneyId" = ${id}
          AND ji."contentType" = 'event'
        ) JourneyItemsUnion
        ORDER BY "createdAt" DESC
      `;

      const results = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      if (!results) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res
          .status(HttpCodes.OK)
          .json({ journeyItems: results });

    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  return {
    getItemsByJourney,
  };
};
module.exports = JourneyItemController;