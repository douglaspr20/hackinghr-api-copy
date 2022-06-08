const db = require("../models");
const moment = require("moment-timezone");
const HttpCodes = require("http-codes");
const { isValidURL } = require("../utils/profile");
const s3Service = require("../services/s3.service");
const smtpService = require("../services/smtp.service");
const { convertToLocalTime } = require("../utils/format");

const SimulationSprint = db.SimulationSprint;
const SimulationSprintResource = db.SimulationSprintResource;

const SimulationSprintController = () => {
  /**
   * Method to create skill cohorts
   * @param {*} req
   * @param {*} res
   */
  const create = async (req, res) => {
    const { body } = req;

    try {
      if (body.image) {
        body.image = await s3Service().getSimulationSprintImageUrl(
          "",
          body.image
        );
      }

      const simulationSprint = await SimulationSprint.create({ ...body });

      return res.status(HttpCodes.OK).json({ simulationSprint });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal server error",
        error,
      });
    }
  };

  /**
   * Method to get a skill cohort
   * @param {*} req
   * @param {*} res
   */
  const get = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        const simulationSprint = await SimulationSprint.findOne({
          where: {
            id,
          },
        });

        if (!simulationSprint) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: Simulation Sprint not found." });
        }

        return res.status(HttpCodes.OK).json({ simulationSprint });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error." });
      }
    }
  };

  /**
   * Method to get all skill cohorts
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    try {
      const simulationSprints = await SimulationSprint.findAll({
        order: [["id", "ASC"]],
        include: {
          model: SimulationSprintResource,
        },
      });

      return res.status(HttpCodes.OK).json({ simulationSprints });
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };

  const duplicate = async (req, res) => {
    const { simulationSprint, simulationSprintResources } = req.body;

    try {
      const newSimulationSprint = await SimulationSprint.create(
        simulationSprint
      );

      const tranformedSimulationSprintResources = simulationSprintResources.map(
        (resource) => ({
          ...resource,
          SimulationSprintId: newSimulationSprint.id,
        })
      );

      await SimulationSprintResource.bulkCreate(
        tranformedSimulationSprintResources
      );

      return res.status(HttpCodes.OK).json({});
    } catch (error) {
      console.log(error);
      return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
        msg: "Internal Server error",
        error,
      });
    }
  };
  /**
   * Method to update a skill cohort
   * @param {*} req
   * @param {*} res
   */
  const update = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        const simulationSprint = await SimulationSprint.findOne({
          where: {
            id,
          },
        });

        if (!simulationSprint) {
          return res
            .status(HttpCodes.BAD_GATEWAY)
            .json({ msg: "Bad Request: Simulation Sprint not found." });
        }

        if (req.body.image && !isValidURL(req.body.image)) {
          req.body.image = await s3Service().getSimulationSprintImageUrl(
            "",
            req.body.image
          );

          if (simulationSprint.image) {
            await s3Service().deleteUserPicture(simulationSprint.image);
          }
        }

        const [numberOfAffectedRows, affectedRows] =
          await SimulationSprint.update(req.body, {
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
    }
  };

  /**
   * Method to remove a skill cohort
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    const { id } = req.params;

    if (id) {
      try {
        await SimulationSprint.destroy({
          where: {
            id,
          },
        });

        return res.status(HttpCodes.OK).json({});
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Skill Cohort id is wrong." });
  };

  const downloadICS = async (req, res) => {
    const { id } = req.params;
    try {
      const simulationSprint = await SimulationSprint.findOne({
        where: { id },
      });

      if (!simulationSprint) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      let startDate = moment(simulationSprint.startDate)
        .tz("America/Los_Angeles")
        .utcOffset(-7, true);

      let endDate = moment(simulationSprint.endDate)
        .tz("America/Los_Angeles")
        .utcOffset(-7, true);

      startDate = convertToLocalTime(startDate);
      endDate = convertToLocalTime(endDate);

      startDate = startDate.format("YYYY-MM-DD h:mm a");

      endDate = endDate.format("YYYY-MM-DD h:mm a");

      const localTimezone = moment.tz.guess();

      const calendarInvite = smtpService().generateCalendarInvite(
        startDate,
        endDate,
        simulationSprint.title,
        simulationSprint.description.html.replace(/<[^>]+>/g, ""),
        "https://www.hackinghrlab.io/simulation-sprints",
        // event.location,
        `${process.env.DOMAIN_URL}/simulation-sprints${simulationSprint.id}`,
        "hacking Lab HR",
        process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
        localTimezone
      );

      let icsContent = calendarInvite.toString();
      icsContent = icsContent.replace(
        "BEGIN:VEVENT",
        `METHOD:REQUEST\r\nBEGIN:VEVENT`
      );

      res.setHeader("Content-Type", "application/ics; charset=UTF-8;");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${encodeURIComponent(simulationSprint.title)}.ics`
      );
      res.setHeader("Content-Length", icsContent.length);
      return res.end(icsContent);
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  return {
    create,
    get,
    remove,
    update,
    getAll,
    duplicate,
    downloadICS,
  };
};

module.exports = SimulationSprintController;
