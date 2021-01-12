const db = require("../models");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");

const Event = db.Event;

const EventController = () => {
  const create = async (req, res) => {
    const { body } = req;

    if (body.title) {
      try {
        let eventInfo = {
          ...body,
        };

        if (eventInfo.image) {
          eventInfo.image = await s3Service().getEventImageUrl(
            "",
            eventInfo.image
          );
        }

        if (eventInfo.image2) {
          eventInfo.image2 = await s3Service().getEventImageUrl(
            "",
            eventInfo.image2
          );
        }

        const event = await Event.create(eventInfo);

        if (!event) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ event });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error", error: err });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Title is needed." });
  };

  const getAllEvents = async (req, res) => {
    try {
      const events = await Event.findAll();

      return res.status(HttpCodes.OK).json({ events });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getEvent = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        const event = await Event.findOne({
          where: {
            id,
          },
        });

        if (!event) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Bad Request: Event not found" });
        }

        return res.status(HttpCodes.OK).json({ event });
      } catch (err) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: event id is wrong" });
    }
  };

  return {
    create,
    getAllEvents,
    getEvent,
  };
};

module.exports = EventController;
