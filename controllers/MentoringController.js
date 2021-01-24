const db = require("../models");
const HttpCodes = require("http-codes");
const Sequelize = require("sequelize");

const Mentoring = db.Mentoring;
const User = db.User;
const QueryTypes = Sequelize.QueryTypes;

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

  const getMentorList = async (req, res) => {
    const filter = req.query;
    const { id } = req.token;

    try {
      let query = `
      SELECT COUNT(*) OVER() AS total, public."Users".*, public."Mentorings"."id" as mid, public."Mentorings"."title" as title, public."Mentorings"."about" as mentorAbout, public."Mentorings"."areas" as areas, public."Mentorings"."isMentor" as isMentor, public."Mentorings"."connectedMembers" as connectedMembers
        FROM public."Mentorings" 
        JOIN public."Users" ON public."Mentorings".user = public."Users".id 
        WHERE public."Mentorings"."isMentor" = 1 AND public."Mentorings"."user" <> ${id}
        LIMIT ${filter.num} OFFSET ${(filter.page - 1) * filter.num}
      `;

      const mentorList = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      return res.status(HttpCodes.OK).json({ mentorList });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getMenteeList = async (req, res) => {
    const filter = req.query;
    const { id } = req.token;

    try {
      let query = `
      SELECT COUNT(*) OVER() AS total, public."Users".*, public."Mentorings"."id" as mid, public."Mentorings"."title" as title, public."Mentorings"."about" as mentorAbout, public."Mentorings"."areas" as areas, public."Mentorings"."isMentor" as isMentor, public."Mentorings"."connectedMembers" as connectedMembers
        FROM public."Mentorings" 
        JOIN public."Users" ON public."Mentorings".user = public."Users".id 
        WHERE public."Mentorings"."isMentor" = 0 AND public."Mentorings"."user" <> ${id}
        LIMIT ${filter.num} OFFSET ${(filter.page - 1) * filter.num}
      `;

      const menteeList = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      return res.status(HttpCodes.OK).json({ menteeList });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const setMatch = async (req, res) => {
    const { source, target, match } = req.query;

    try {
      let updates = {
        connectedMembers: Sequelize.fn(
          match ? "array_append" : "array_remove",
          Sequelize.col("connectedMembers"),
          target
        ),
      };

      const [numberOfAffectedRows, affectedRows] = await Mentoring.update(updates, {
        where: { id: source },
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
    create,
    getMentoringInfo,
    updateMentoringInfo,
    getMentorList,
    getMenteeList,
    setMatch,
  };
};

module.exports = MentoringController;
