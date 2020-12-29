const db = require("../models");
const HttpCodes = require("http-codes");
const UserRoles = require("../enum").USER_ROLE;
const bcryptService = require("../services/bcrypt.service");
const authService = require("../services/auth.service");

const User = db.User;

const AuthController = () => {
  const login = async (req, res) => {
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
            .json({ msg: "Bad Request: User not found" });
        }

        if (bcryptService().comparePassword(password, user.password)) {
          const token = authService().issue({ id: user.id });

          return res.status(HttpCodes.OK).json({ token, user });
        }

        return res.status(HttpCodes.UNAUTHORIZED).json({ msg: "Unauthorized" });
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

  const register = async (req, res) => {
    const { body } = req;

    console.log("**** register ", body);

    if (body.password === body.password2) {
      try {
        const userInfo = {
          email: body.email,
          password: bcryptService().password(body.password),
          firstName: body.firstName,
          lastName: body.lastName,
          role: UserRoles.USER,
        };

        console.log("**** userInfo ", userInfo);

        const user = await User.create(userInfo);

        if (!user) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        const token = authService().issue({ id: user.id });

        return res.status(HttpCodes.OK).json({ token, user });
      } catch (err) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }
    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Passwords don't match" });
  };

  return {
    login,
    register,
  };
};

module.exports = AuthController;
