const db = require("../models");
const HttpCodes = require("http-codes");
const UserRoles = require("../enum").USER_ROLE;
const bcryptService = require("../services/bcrypt.service");

const User = db.User;

const checkIsAdmin = async (req, res, next) => {
  const { email, password } = req.body;

  if (email && password) {
    try {
      const user = await User.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Email is wrong." });
      }

      if (user.role !== UserRoles.ADMIN) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "You are not allowed." });
      }

      if (bcryptService().comparePassword(password, user.password)) {
        return next();
      }

      return res
        .status(HttpCodes.UNAUTHORIZED)
        .json({ msg: "Password is wrong." });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  }

  return res
    .status(HttpCodes.BAD_REQUEST)
    .json({ msg: "Bad Request: Email or password is wrong" });
};

module.exports = {
  checkIsAdmin,
};
