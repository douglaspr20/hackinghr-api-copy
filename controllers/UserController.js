const db = require("../models");
const profileUtils = require("../utils/profile");
const HttpCodes = require("http-codes");

const User = db.User;

const UserController = () => {
  const getUser = async (req, res) => {
    const { id } = req.query;

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
    const { id } = req.query;

    if (user) {
      try {
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

  const updateImage = async (req, res) => {
    const { id } = req.query;

    try {
      let user = await User.findOne({
        where: {
          id,
        },
      });

      user = { ...user.dataValues, img: req.file };

      user.percentOfCompletion = profileUtils.getProfileCompletion(user);

      user.completed = user.percentOfCompletion === 100;

      let [numberOfAffectedRows, affectedRows] = await User.update(user, {
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
  };

  return {
    getUser,
    updateUser,
    updateImage,
  };
};

module.exports = UserController;
