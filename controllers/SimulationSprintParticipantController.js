const db = require("../models");
const HttpCodes = require("http-codes");
const smtpService = require("../services/smtp.service");
const { LabEmails } = require("../enum");
const moment = require("moment");

const SimulationSprintParticipant = db.SimulationSprintParticipant;
const SimulationSprint = db.SimulationSprint;
const User = db.User;

const SimulationSprintParticipantController = () => {
  /**
   * Create a skill cohort participant
   * @param {*} req
   * @param {*} res
   */
  const create = async (req, res) => {
    const { SimulationSprintId } = req.body;
    const { user } = req;

    try {
      const simulationSprint = await SimulationSprint.findOne({
        where: {
          id: SimulationSprintId,
        },
      });

      if (simulationSprint) {
        const simulationSprintParticipant =
          await SimulationSprintParticipant.create({
            ...req.body,
          });

        if (simulationSprintParticipant) {
          const mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_SENDER,
            to: user.email,
            subject: LabEmails.JOIN_SIMULATION_SPRINT.subject,
            html: LabEmails.JOIN_SIMULATION_SPRINT.body(user),
          };

          await smtpService().sendMailUsingSendInBlue(mailOptions);

          return res.status(HttpCodes.OK).json({ simulationSprintParticipant });
        }

        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "BSomething Went Wrong" });
      } else {
        return res
          .status(HttpCodes.BAD_REQUEST)
          .json({ msg: "Bad Request: Simulation Sprint not found." });
      }
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  /**
   * Get a skill cohort participant
   * @param {*} req
   * @param {*} res
   */
  const get = async (req, res) => {
    const { skillCohortId, userId } = req.params;

    try {
      const skillCohortParticipant = await SkillCohortParticipant.findOne({
        where: {
          SkillCohortId: skillCohortId,
          UserId: userId,
        },
      });

      if (!skillCohortParticipant) {
        return res.status(HttpCodes.BAD_REQUEST).json({
          msg: "Bad Request: Skill Cohort Participant not found.",
        });
      }

      return res.status(HttpCodes.OK).json({ skillCohortParticipant });
    } catch (error) {
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  /**
   * Get all skill cohort participants
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    const { SkillCohortId } = req.params;

    let where = {};
    try {
      if (SkillCohortId) {
        where = {
          SkillCohortId,
        };
      }

      const allSkillCohortParticipants = await SkillCohortParticipant.findAll({
        where: {
          ...where,
          hasAccess: true,
        },
        include: db.User,
      });

      return res.status(HttpCodes.OK).json({ allSkillCohortParticipants });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };

  const getParticipantsBySimulationSprint = async (req, res) => {
    const { SimulationSprintId } = req.params;
    try {
      const simulattionSprintParticipants =
        await SimulationSprintParticipant.findAll({
          where: {
            SimulationSprintId,
          },
          include: [
            {
              model: User,
              attributes: ["firstName", "lastName", "email"],
            },
          ],
        });

      return res.status(HttpCodes.OK).json({ simulattionSprintParticipants });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };

  return {
    create,
    get,
    getAll,
    getParticipantsBySimulationSprint,
  };
};

module.exports = SimulationSprintParticipantController;
