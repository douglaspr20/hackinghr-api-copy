const db = require("../models");
const profileUtils = require("../utils/profile");
const HttpCodes = require("http-codes");
const s3Service = require("../services/s3.service");

const User = db.User;
const Event = db.Event;

const UserController = () => {
  const getUser = async (req, res) => {
    const { id } = req.token;

    if (id) {
      try {
        const user = await User.findOne({
          where: {
            id,
          },
        });

        if (!user) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Bad Request: User not found" });
        }

        return res.status(HttpCodes.OK).json({ user });
      } catch (error) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: user id is wrong" });
    }
  };

  const updateUser = async (req, res) => {
    let user = req.body;
    const { id } = req.token;

    if (user) {
      try {
        const prevUser = await User.findOne({
          where: {
            id,
          },
        });
        if (!prevUser) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: data is wrong" });
        }

        // in case of email update
        if (user.email !== prevUser.email) {
          const existing = await User.findOne({
            where: {
              email: user.email,
            },
          });

          if (existing) {
            return res
              .status(HttpCodes.BAD_REQUEST)
              .json({ msg: "This email was used by someone." });
          }
        }

        // in case of profile picture
        if (user.imageStr) {
          const imageUrl = await s3Service().getUserImageUrl(
            user.img,
            user.imageStr
          );
          user.img = imageUrl;
        }
        user.percentOfCompletion = profileUtils.getProfileCompletion(user);
        user.completed = user.percentOfCompletion === 100;
        user.abbrName = `${(user.firstName || "").slice(0, 1).toUpperCase()}${(
          user.lastName || ""
        )
          .slice(0, 1)
          .toUpperCase()}`;

        const [numberOfAffectedRows, affectedRows] = await User.update(user, {
          where: { id },
          returning: true,
          plain: true,
        });

        return res
          .status(HttpCodes.OK)
          .json({ numberOfAffectedRows, affectedRows });
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

  const upgradePlan = async (req, res) => {
    let data = req.body;
    const { id } = req.token;

    if (data && data.memberShip) {
      try {
        const [numberOfAffectedRows, affectedRows] = await User.update(
          { memberShip: data.memberShip },
          {
            where: { id },
            returning: true,
            plain: true,
          }
        );

        return res
          .status(HttpCodes.OK)
          .json({ numberOfAffectedRows, affectedRows });
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

  const addEvent = async (req, res) => {
    let event = req.body;
    const { id } = req.token;

    try {
      const user = await User.findOne({
        where: {
          id,
        },
      });

      if (!user) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "User not found" });
      }

      let newEvents = user.events
        .map((item) => JSON.parse(item))
        .filter((item) => item.id !== event.id);
      newEvents = [
        ...newEvents,
        { id: event.id, status: "going" },
      ].map((item) => JSON.stringify(item));

      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          events: newEvents,
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );

      return res
        .status(HttpCodes.OK)
        .json({ numberOfAffectedRows, affectedRows });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const removeEvent = async (req, res) => {
    let event = req.body;
    const { id } = req.token;

    try {
      const user = await User.findOne({
        where: {
          id,
        },
      });
      user.events = user.events
        .map((item) => JSON.parse(item))
        .filter((e) => e.id !== event.id)
        .map((item) => JSON.stringify(item));

      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          events: user.events,
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );

      return res
        .status(HttpCodes.OK)
        .json({ numberOfAffectedRows, affectedRows });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getMyEvents = async (req, res) => {
    const { id } = req.token;

    try {
      const user = await User.findOne({
        where: {
          id,
        },
      });

      if (!user) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "User not found" });
      }

      let requests = user.events
        .map((item) => JSON.parse(item))
        .map((item) => {
          return Event.findOne({
            where: {
              id: item.id,
            },
          });
        });

      let results = await Promise.all(requests);
      results = results.map((event, index) => ({
        ...event.dataValues,
        status: JSON.parse(user.events[index]).status,
      }));

      return res.status(HttpCodes.OK).json({ myEvents: results });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  return {
    getUser,
    updateUser,
    upgradePlan,
    addEvent,
    removeEvent,
    getMyEvents,
  };
};

module.exports = UserController;
