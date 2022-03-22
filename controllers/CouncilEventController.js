const db = require("../models");
const HttpCodes = require("http-codes");
const { LabEmails, TimeZoneList } = require("../enum");
const smtpService = require("../services/smtp.service");
const moment = require("moment-timezone");

const CouncilEvent = db.CouncilEvent;
const CouncilEventPanel = db.CouncilEventPanel;
const CouncilEventPanelist = db.CouncilEventPanelist;
const User = db.User;

const CouncilEventController = () => {
  const upsert = async (req, res) => {
    const data = req.body;

    try {
      const councilEvent = await db.sequelize.transaction(async (t) => {
        const [councilEvent] = await CouncilEvent.upsert(
          data,
          {
            returning: true,
            raw: true,
          },
          {
            transaction: t,
          }
        );

        const isPanelFull = data.panels.length > +councilEvent.numberOfPanels;
        if (isPanelFull) {
          throw new Error();
        }

        const councilEventPanels = data.panels.map((panel) => {
          return CouncilEventPanel.upsert(
            {
              ...panel,
              CouncilEventId: councilEvent.id,
            },
            { returning: true, raw: true }
          );
        });

        await Promise.all(councilEventPanels);

        const _councilEvent = await CouncilEvent.findOne({
          where: {
            id: councilEvent.id,
          },
          include: [
            {
              model: CouncilEventPanel,
              include: [
                {
                  model: CouncilEventPanelist,
                },
              ],
            },
          ],
        });

        return _councilEvent;
      });

      return res.status(HttpCodes.OK).json({ councilEvent });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getAll = async (req, res) => {
    try {
      let councilEvents = await CouncilEvent.findAll({
        order: [["createdAt", "ASC"]],
        include: [
          {
            model: CouncilEventPanel,
            include: [
              {
                model: CouncilEventPanelist,
                include: [
                  {
                    model: User,
                  },
                ],
              },
            ],
          },
        ],
      });

      return res.status(HttpCodes.OK).json({ councilEvents });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const destroy = async (req, res) => {
    const { id } = req.params;

    try {
      await CouncilEvent.destroy({
        where: {
          id,
        },
      });

      const councilEvents = await CouncilEvent.findAll();

      return res.status(HttpCodes.OK).json({ councilEvents });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const joinCouncilEventPanelist = async (req, res) => {
    const { id, email } = req.user;
    const { councilEventPanelId, status } = req.body;
    const { userTimezone } = req.query;

    try {
      if (status === "Join") {
        const councilEventPanel = await CouncilEventPanel.findOne({
          where: {
            id: councilEventPanelId,
          },
        });

        const councilEventPanelistsCount = await CouncilEventPanelist.count({
          where: { CouncilEventPanelId: councilEventPanelId },
        });

        const isFull =
          councilEventPanelistsCount >= councilEventPanel.numberOfPanelists;

        if (isFull) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        await CouncilEventPanelist.create({
          CouncilEventPanelId: councilEventPanelId,
          UserId: id,
        });

        const startTime = councilEventPanel.panelStartAndEndDate[0];
        const endTime = councilEventPanel.panelStartAndEndDate[1];

        const convertedStartTimeToLocalTimezone = moment.tz(
          startTime,
          userTimezone
        );
        const convertedEndTimeToLocalTimezone = moment.tz(
          endTime,
          userTimezone
        );

        const calendarInvite = smtpService().generateCalendarInvite(
          convertedStartTimeToLocalTimezone,
          convertedEndTimeToLocalTimezone,
          councilEventPanel.panelName,
          `Link to join: ${councilEventPanel.linkToJoin}`,
          "",
          // event.location,
          "",
          "Hacking HR",
          process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
          userTimezone
        );

        let icsContent = calendarInvite.toString();
        icsContent = icsContent.replace(
          "BEGIN:VEVENT",
          `METHOD:REQUEST\r\nBEGIN:VEVENT`
        );
        console.log(icsContent, "icsContent");

        const mailOptions = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          to: email,
          subject: LabEmails.COUNCIL_EVENT_JOIN.subject(),
          html: LabEmails.COUNCIL_EVENT_JOIN.body(),
          contentType: "text/calendar",
          attachments: [
            {
              filename: `${councilEventPanel.panelName}.ics`,
              content: icsContent,
              contentType: "application/ics; charset=UTF-8; method=REQUEST",
              contentDisposition: "inline",
            },
          ],
        };

        smtpService().sendMailUsingSendInBlue(mailOptions);
      } else {
        await CouncilEventPanelist.destroy({
          where: {
            UserId: id,
          },
        });
      }

      const councilEventPanel = await CouncilEventPanel.findOne({
        where: {
          id: councilEventPanelId,
        },
        include: [
          {
            model: CouncilEventPanelist,
            include: [
              {
                model: User,
              },
            ],
          },
        ],
      });

      return res.status(HttpCodes.OK).json({ councilEventPanel });
    } catch (err) {
      console.log(err);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const downloadICS = async (req, res) => {
    const { id } = req.params;
    const { userTimezone } = req.query;

    try {
      let councilEventPanel = await CouncilEventPanel.findOne({
        where: { id },
      });

      if (!councilEventPanel) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      const startDate = councilEventPanel.panelStartAndEndDate[0];
      const endDate = councilEventPanel.panelStartAndEndDate[1];

      console.log(
        moment
          .tz(startDate, "America/Los_Angeles")
          .format("YYYY-MM-DD HH:mm:ssZ")
      );
      const convertedStartDateToLocalTimezone = moment.tz(
        startDate,
        userTimezone
      );
      const convertedEndDateToLocalTimezone = moment.tz(endDate, userTimezone);

      const calendarInvite = smtpService().generateCalendarInvite(
        convertedStartDateToLocalTimezone,
        convertedEndDateToLocalTimezone,
        councilEventPanel.panelName,
        "",
        "",
        // event.location,
        "",
        "Hacking HR",
        process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
        userTimezone
      );

      let icsContent = calendarInvite.toString();
      icsContent = icsContent.replace(
        "BEGIN:VEVENT",
        `METHOD:REQUEST\r\nBEGIN:VEVENT`
      );

      res.setHeader("Content-Type", "application/ics; charset=UTF-8;");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${encodeURIComponent(
          councilEventPanel.panelName
        )}.ics`
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
    upsert,
    getAll,
    destroy,
    joinCouncilEventPanelist,
    downloadICS,
  };
};

module.exports = CouncilEventController;
