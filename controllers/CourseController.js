const db = require("../models");
const HttpCodes = require("http-codes");
const Sequelize = require("sequelize");
const s3Service = require("../services/s3.service");
const { isValidURL } = require("../utils/profile");

const QueryTypes = Sequelize.QueryTypes;
const Course = db.Course;

const CourseController = () => {
  /**
   * Method to get all Course objects
   * @param {*} req 
   * @param {*} res 
   */
  const getAll = async (req, res) => {
    try {
      let courses = await Course.findAll({
        order: [
          ['createdAt', 'DESC'],
        ],
      });
      if (!courses) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res.status(HttpCodes.OK).json({ courses });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to get Course object
   * @param {*} req 
   * @param {*} res 
   */
  const get = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        const course = await Course.findOne({
          where: {
            id,
          },
        });

        if (!course) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ course });
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
  /**
   * Method to add Course object
   * @param {*} req 
   * @param {*} res 
   */
  const add = async (req, res) => {
    const { imageData } = req.body;
    try {
      let course = await Course.create({ ...req.body });
      if (imageData) {
        let image = await s3Service().getCourseImageUrl("", imageData);
        await Course.update(
          { image: image },
          { where: { id: course.id }, }
        );
      }
      return res
        .status(HttpCodes.OK)
        .send();
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to update Course object
   * @param {*} req 
   * @param {*} res 
   */
  const update = async (req, res) => {
    const { id } = req.params;
    const { body } = req

    if (id) {
      try {
        let data = {};
        let fields = [
          "title",
          "description",
          "topics",
        ];
        for (let item of fields) {
          if (body[item]) {
            data = { ...data, [item]: body[item] };
          }
        }

        const course = await Course.findOne({
          where: {
            id,
          },
        });
        if (!course) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: course not found." });
        }
        if (body.imageData && !isValidURL(body.imageData)) {
          data.image = await s3Service().getCourseImageUrl(
            "",
            body.imageData
          );

          if (course.image) {
            await s3Service().deleteUserPicture(course.imageData);
          }
        }

        if (data.image && !body.imageData) {
          await s3Service().deleteUserPicture(course.image);
        }

        await Course.update(data, {
          where: { id }
        });

        return res
          .status(HttpCodes.OK)
          .send();
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
  /**
   * Method to delete Course object
   * @param {*} req 
   * @param {*} res 
   */
  const remove = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        await Course.destroy({
          where: { id }
        });
        return res
          .status(HttpCodes.OK)
          .send();
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

  /**
   * Method to get instructors by Course
   * @param {*} req 
   * @param {*} res 
   */
  const getInstructorsByCourse = async (req, res) => {
    let { course } = req.params;

    if (course) {
      try {
        let query = `
        select i.* from "Instructors" i 
        inner join "CourseInstructors" ci on i."id" = ci."InstuctorId"
        where ci."CourseId" = ${course}`;
        const instructors = await db.sequelize.query(query, {
          type: QueryTypes.SELECT,
        });

        if (!instructors) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res
          .status(HttpCodes.OK)
          .json({ instructors });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }
  };

  /**
   * Method to get instructors by Course
   * @param {*} req 
   * @param {*} res 
   */
  const getSponsorsByCourse = async (req, res) => {
    let { course } = req.params;

    if (course) {
      try {
        let query = `
        select s.* from "Sponsors" s
        inner join "CourseSponsors" cs on s."id" = cs."SponsorId"
        where cs."CourseId" = ${course}`;
        const sponsors = await db.sequelize.query(query, {
          type: QueryTypes.SELECT,
        });

        if (!sponsors) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res
          .status(HttpCodes.OK)
          .json({ sponsors });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }
  };

  return {
    getAll,
    get,
    add,
    update,
    remove,
    getInstructorsByCourse,
    getSponsorsByCourse,
  };
};

module.exports = CourseController;