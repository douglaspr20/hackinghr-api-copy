const db = require("../models");
const HttpCodes = require("http-codes");
const UserRoles = require("../enum").USER_ROLE;
const bcryptService = require("../services/bcrypt.service");
const authService = require("../services/auth.service");
const reCaptchaService = require("../services/recaptcha.service");
const profileUtils = require("../utils/profile");

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
            .json({ msg: "Email is wrong." });
        }

        if (bcryptService().comparePassword(password, user.password)) {
          const token = authService().issue({ id: user.id });

          return res.status(HttpCodes.OK).json({ token, user });
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

  const register = async (req, res) => {
    const { body } = req;

    if (body.password === body.password2) {
      try {
        const recaptChaVerify = await reCaptchaService().verify(body.recaptcha);
        if (!recaptChaVerify) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "ReCAPTCHA verification failed. Please try again." });
        }

        let userInfo = {
          email: body.email,
          password: bcryptService().password(body.password),
          firstName: body.firstName,
          lastName: body.lastName,
          role: UserRoles.USER,
        };

        userInfo.percentOfCompletion = profileUtils.getProfileCompletion(
          userInfo
        );
        userInfo.completed = userInfo.percentOfCompletion === 100;
        userInfo.abbrName = `${(userInfo.firstName || "")
          .slice(0, 1)
          .toUpperCase()}${(userInfo.lastName || "")
          .slice(0, 1)
          .toUpperCase()}`;

        // check if the email is already used.
        const existedUser = await User.findOne({
          where: {
            email: userInfo.email,
          },
        });

        if (existedUser) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "This email was used by someone" });
        } else {
          console.log("**** userInfo ", userInfo);
          const user = await User.create(userInfo);

          if (!user) {
            return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
          }

          const token = authService().issue({ id: user.id });

          return res.status(HttpCodes.OK).json({ token, user });
        }
      } catch (err) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error", error: err });
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
