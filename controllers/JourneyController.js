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

const JourneyController = () => {
  /**
   * Method to get all journey objects
   * @param {*} req 
   * @param {*} res 
   */
  const getAll = async (req, res) => {
    const { id: UserId } = req.token;
    try {
      let where = { UserId };
      let journeys = await Journey.findAll({
        where,
        order: [
          ['createdAt', 'DESC'],
        ],
      });
      if (!journeys) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res
        .status(HttpCodes.OK)
        .json({ journeys });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to get journey object
   * @param {*} req 
   * @param {*} res 
   */
  const get = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        const journey = await Journey.findOne({
          where: {
            id,
          },
        });

        if (!journey) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res
          .status(HttpCodes.OK)
          .json({ journey });
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
   * Method to add journey object
   * @param {*} req 
   * @param {*} res 
   */
  const add = async (req, res) => {
    const { topics, contentType } = req.body;
    const { id: userId } = req.token;
    try {
      let journey = await Journey.create({ ...req.body, UserId: userId });

      topics.forEach(async (itemTopic) => {
        contentType.forEach(async (itemContent) => {
          let prefixQuery = 'INSERT INTO "JourneyItems" ("JourneyId", "topic", "contentType", "contentId", "itemCreatedAt", "createdAt", "updatedAt") ';
          let table = {
            article: "Libraries",
            event: "Events",
            podcast: "Podcasts",
            video: "Libraries",
          };

          let query = `
            ${prefixQuery}
            SELECT ${journey.id}, '${itemTopic}', '${itemContent}', public."${table[itemContent]}".id, public."${table[itemContent]}"."createdAt", NOW(), NOW()
            FROM public."${table[itemContent]}"
            WHERE`;

          if (itemContent !== 'event') {
            query += ` '${itemTopic}' = ANY(public."${table[itemContent]}".topics)`;
          } else {
            query += ` '${itemTopic}' = ANY(public."${table[itemContent]}".categories)`;
          }

          if (itemContent !== 'event') {
            query += ` AND public."${table[itemContent]}"."contentType" = '${itemContent}'`;
          }

          query += `  AND public."${table[itemContent]}".id NOT IN 
            (
              SELECT public."JourneyItems"."contentId" from public."JourneyItems" 
              WHERE public."JourneyItems"."JourneyId" = ${journey.id} 
              AND public."JourneyItems"."contentType" = '${itemContent}'

            )
          `;
          await db.sequelize.query(query, {
            type: QueryTypes.INSERT,
          });
        });
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
   * Method to updated journey object
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
          "name",
          "description",
          "topics",
          "contentType",
          "mainLanguage",
        ];
        for (let item of fields) {
          if (body[item]) {
            data = { ...data, [item]: body[item] };
          }
        }
        await Journey.update(data, {
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
   * Method to delete journey object
   * @param {*} req 
   * @param {*} res 
   */
  const remove = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        await Journey.destroy({
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

  const getJourneyItems = async () => {
    const JourneyId = 1;
    const query = `
      SELECT id, title, description, link, "createdAt" FROM (
        SELECT ji.id, l.title, l.description, l.link, l."createdAt" FROM "Libraries" l
        INNER JOIN "JourneyItems" ji ON l.id = ji."contentId"
        WHERE ji."JourneyId" = ${JourneyId}
        AND ji."contentType" IN ('article', 'video')
        UNION
        SELECT ji.id, p.title, p.description, p."appleLink" AS link, p."createdAt" FROM "Podcasts" p
        INNER JOIN "JourneyItems" ji ON p.id = ji."contentId"
        WHERE ji."JourneyId" = ${JourneyId}
        AND ji."contentType" = 'podcast'
        UNION
        SELECT ji.id, e.title, CAST(e.description AS varchar) AS description, e.link, e."createdAt" FROM "Events" e
        INNER JOIN "JourneyItems" ji ON e.id = ji."contentId"
        WHERE ji."JourneyId" = ${JourneyId}
        AND ji."contentType" = 'event'
      ) JourneyItemsUnion
      ORDER BY "createdAt" DESC
    `
  }

  return {
    getAll,
    get,
    add,
    update,
    remove,
  };
};

module.exports = JourneyController;