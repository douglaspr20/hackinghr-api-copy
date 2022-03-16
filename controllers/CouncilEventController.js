const db = require("../models");
const HttpCodes = require("http-codes");

const CouncilEvent = db.CouncilEvent;
const User = db.User;

const CouncilEventController = () => {
  const upsert = async (req, res) => {
    const data = req.body;

    try {
      if (data.isJoining) {
        const councilEvent = await CouncilEvent.findOne({
          where: {
            id: data.id,
          },
        });

        const isFull =
          councilEvent.panels[data.panelIndex].panelists.length >=
          +councilEvent.panels[data.panelIndex].numberOfPanelists;

        if (isFull) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }
      }

      let [councilEvent] = await CouncilEvent.upsert(data, {
        returning: true,
        raw: true,
      });
      councilEvent = councilEvent.dataValues;

      const panelists = councilEvent.panels.map((panel) => {
        return User.findAll({
          where: {
            id: panel.panelists || [],
          },
        });
      });

      const panelistsData = await Promise.all(panelists);
      const panels = councilEvent.panels.map((panel, panelIndex) => {
        return {
          ...panel,
          panelistsData: panelistsData[panelIndex],
        };
      });

      councilEvent = {
        ...councilEvent,
        panels,
      };

      return res.status(HttpCodes.OK).json({ councilEvent });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getAll = async (req, res) => {
    try {
      let councilEvents = await CouncilEvent.findAll({
        order: [["createdAt", "ASC"]],
        raw: true,
      });

      const jaggeredCouncilEvents = councilEvents.map((event) => {
        const events = event.panels.map((panel) => {
          return User.findAll({
            where: {
              id: panel.panelists || [],
            },
          });
        });

        return events;
      });

      let data = jaggeredCouncilEvents.map(
        async (event) => await Promise.all(event)
      );
      data = await Promise.all(data);

      councilEvents = councilEvents.map((event, eventIndex) => {
        const panels = event.panels.map((panel, panelIndex) => {
          return {
            ...panel,
            panelistsData: data[eventIndex][panelIndex],
          };
        });

        return {
          ...event,
          panels,
        };
      });

      return res.status(HttpCodes.OK).json({ councilEvents });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const destroy = async (req, res) => {
    const { id } = req.params;

    try {
      await CouncilEvent.destroy({
        where: {
          id,
        },
      });

      const councilEvents = await CouncilEvent.findAll();

      return res.status(HttpCodes.OK).json({ councilEvents });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  return {
    upsert,
    getAll,
    destroy,
  };
};

module.exports = CouncilEventController;
