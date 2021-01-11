const db = require("../models");
const HttpCodes = require("http-codes");
const UserRoles = require("../enum").USER_ROLE;
const bcryptService = require("../services/bcrypt.service");
const authService = require("../services/auth.service");

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

const checkAdminRole = async (req, res, next) => {
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
          .json({ msg: "User not found." });
      }

      if (user.role !== UserRoles.ADMIN) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "You are not allowed." });
      }
      return next();
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  }

  return res.status(HttpCodes.BAD_REQUEST).json({ msg: "User not found." });
};

const validate = async (req, res, next) => {
  let tokenToVerify;

  if (req.header("Authorization")) {
    const parts = req.header("Authorization").split(" ");

    if (parts.length === 2) {
      const scheme = parts[0];
      const credentials = parts[1];

      if (/^Bearer$/.test(scheme)) {
        tokenToVerify = credentials;
      } else {
        return res
          .status(401)
          .json({ msg: "Format for Authorization: Bearer [token]" });
      }
    } else {
      return res
        .status(401)
        .json({ msg: "Format for Authorization: Bearer [token]" });
    }
  } else if (req.body.token) {
    tokenToVerify = req.body.token;
    delete req.query.token;
  } else {
    return res.status(401).json({ msg: "No Authorization was found" });
  }

  return authService().verify(tokenToVerify, (err, thisToken) => {
    if (err) return res.status(401).json({ err });
    req.token = thisToken;
    return next();
  });
};

module.exports = {
  checkIsAdmin,
  checkAdminRole,
  validate,
};
