const db = require("../models");
const HttpCodes = require("http-codes");
const user = require("../models/user");

const Mentoring = db.Mentoring;
const User = db.User;

const MentoringController = () => {
  const create = async (req, res) => {
    const { body } = req;
    const { id } = req.token;

    if (body.title) {
      let mentorInfo = {
        ...body,
      };
      // create a record on Mentoring table
      const mentor = await Mentoring.create({ ...mentorInfo, user: id });
      // add reference to User table
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          [mentorInfo.isMentor ? "mentor" : "mentee"]: mentor.id,
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );

      return res
        .status(HttpCodes.OK)
        .json({ user: affectedRows, mentorInfo: mentor });
    } else {
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error", error: error });
    }
  };

  const getMentoringInfo = async (req, res) => {
    const { id } = req.token;

    try {
      const mentoringInfo = await Mentoring.findAll({
        where: {
          user: id,
        },
      });

      if (!mentoringInfo) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Bad Request: Event not found" });
      }

      return res.status(HttpCodes.OK).json({ mentoringInfo });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const updateMentoringInfo = async (req, res) => {
    const { body } = req;

    if (body.id && body.title) {
      let mentorInfo = {
        title: body.title,
        areas: body.areas,
        about: body.about,
      };
      // create a record on Mentoring table
      const [numberOfAffectedRows, affectedRows] = await Mentoring.update(
        {
          ...mentorInfo,
        },
        {
          where: { id: body.id },
          returning: true,
          plaing: true,
        }
      );
      // add reference to User table
      return res.status(HttpCodes.OK).json({ mentorInfo: affectedRows });
    } else {
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error", error: error });
    }
  };

  return {
    create,
    getMentoringInfo,
    updateMentoringInfo,
  };
};

module.exports = MentoringController;
