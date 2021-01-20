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
      const mentor = await Mentoring.create(mentorInfo);
      console.log("***** mentor", mentor);
      console.log("***** where", {
        [mentorInfo.isMentor ? "mentor" : "mentee"]: mentor.id,
      });
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

  return {
    create,
  };
};

module.exports = MentoringController;
