const db = require("../models");
const HttpCodes = require("http-codes");
const Sequelize = require("sequelize");

const QueryTypes = Sequelize.QueryTypes;
const Journey = db.Journey;
const JourneyItems = db.JourneyItems;

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
      loadJourneyItems(journey.id ,topics, contentType);

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
    const { body } = req

    if (id) {
      try {
        let data = {};
        let fields = [
          "name",
          "description",
          "topics",
          "contentType",
        ];
        for (let item of fields) {
          if (body[item]) {
            data = { ...data, [item]: body[item] };
          }
        }
        let journey = await Journey.update(data, {
          where: { id }
        })
        await JourneyItems.destroy({
          where: { JourneyId: id }
        });
        loadJourneyItems(id, body.topics, body.contentType);

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

  const loadJourneyItems = (journeyId, topics, contentType) => {
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
          SELECT ${journeyId}, '${itemTopic}', '${itemContent}', public."${table[itemContent]}".id, public."${table[itemContent]}"."createdAt", NOW(), NOW()
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
            WHERE public."JourneyItems"."JourneyId" = ${journeyId} 
            AND public."JourneyItems"."contentType" = '${itemContent}'

          )
        `;
        await db.sequelize.query(query, {
          type: QueryTypes.INSERT,
        });
      });
    });
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