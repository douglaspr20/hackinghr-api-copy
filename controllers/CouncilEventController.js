const db = require("../models");
const HttpCodes = require("http-codes");
const { Op } = require("sequelize");
const { LabEmails, TimeZoneList } = require("../enum");
const smtpService = require("../services/smtp.service");
const moment = require("moment-timezone");
const { convertToCertainTime, convertToLocalTime } = require("../utils/format");
const { isEmpty } = require("lodash");
const socketService = require("../services/socket.service");
const SocketEventType = require("../enum/SocketEventTypes");

const CouncilEvent = db.CouncilEvent;
const CouncilEventPanel = db.CouncilEventPanel;
const CouncilEventPanelist = db.CouncilEventPanelist;
const User = db.User;
const CouncilEventPanelComment = db.CouncilEventPanelComment;

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

        if (!isEmpty(data.panels)) {
          const isPanelFull = data.panels.length > +councilEvent.numberOfPanels;

          if (isPanelFull) {
            throw new Error();
          }
        }

        if (!isEmpty(data.panels)) {
          const _councilEventPanels = await CouncilEventPanel.findAll({
            where: {
              CouncilEventId: councilEvent.id,
            },
          });

          const _councilEventPanelIds = _councilEventPanels.map(
            (panel) => panel.id
          );
          const councilEventPanelIds = data.panels.map((panel) => panel.id);

          const councilEventPanelIdDiff = _councilEventPanelIds.filter(
            (id) => !councilEventPanelIds.includes(id)
          );

          await CouncilEventPanel.destroy({
            where: {
              id: councilEventPanelIdDiff,
            },
          });
        }

        const councilEventPanels = data.panels?.map((panel) => {
          return CouncilEventPanel.upsert(
            {
              ...panel,
              CouncilEventId: councilEvent.id,
            },
            { returning: true, raw: true }
          );
        });

        if (!isEmpty(councilEventPanels)) {
          await Promise.all(councilEventPanels);
        }

        const _councilEvent = await CouncilEvent.findOne({
          where: {
            id: councilEvent.id,
          },
          order: [[CouncilEventPanel, "startDate", "ASC"]],
          include: [
            {
              model: CouncilEventPanel,
              include: [
                {
                  model: CouncilEventPanelist,
                  include: [
                    {
                      model: User,
                      attributes: [
                        "id",
                        "firstName",
                        "lastName",
                        "titleProfessions",
                        "img",
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        });

        return _councilEvent;
      });

      if (!councilEvent.isEmailSent && councilEvent.status === "active") {
        const users = await User.findAll({
          where: {
            councilMember: "TRUE",
          },
        });

        const timezone = TimeZoneList.find(
          (tz) => tz.value === councilEvent.timezone
        );

        const startDate = moment.tz(councilEvent.startDate, timezone.utc[0]);
        const endDate = moment.tz(councilEvent.endDate, timezone.utc[0]);

        const event = {
          startDate: startDate.format("LL"),
          startTime: startDate.format("HH:mm"),
          endDate: endDate.format("LL"),
          endTime: endDate.format("HH:mm"),
          numberOfPanels: councilEvent.CouncilEventPanels.length,
          maxNumberOfPanelsUsersCanJoin:
            councilEvent.maxNumberOfPanelsUsersCanJoin,
          eventName: councilEvent.eventName,
        };

        const panels = councilEvent.CouncilEventPanels.map((panel) => {
          const startDate = moment.tz(panel.startDate, timezone.utc[0]);

          return `<p>${startDate.format("LL")} at ${startDate.format(
            "HH:mm"
          )}: ${panel.panelName}</p>`;
        }).join("");

        users.forEach((user) => {
          const mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_USER,
            to: user.email,
            subject:
              LabEmails.EMAIL_ALL_COUNCIL_MEMBERS_WHEN_NEW_EVENT_IS_CREATED.subject(
                councilEvent.eventName
              ),
            html: LabEmails.EMAIL_ALL_COUNCIL_MEMBERS_WHEN_NEW_EVENT_IS_CREATED.body(
              user.firstName,
              event,
              panels
            ),
            contentType: "text/html",
          };

          smtpService().sendMailUsingSendInBlue(mailOptions);
        });

        await CouncilEvent.update(
          { isEmailSent: "TRUE" },
          {
            where: {
              id: councilEvent.id,
            },
          }
        );
      }

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
        order: [[CouncilEventPanel, "startDate", "ASC"]],
        include: [
          {
            model: CouncilEventPanel,
            include: [
              {
                model: CouncilEventPanelComment,
                separate: true,
                order: [["createdAt", "ASC"]],
                include: [
                  {
                    model: CouncilEventPanelist,
                    duplicating: true,
                    include: [
                      {
                        model: User,
                        attributes: [
                          "id",
                          "firstName",
                          "lastName",
                          "titleProfessions",
                          "img",
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                model: CouncilEventPanelist,
                include: [
                  {
                    model: User,
                    attributes: [
                      "id",
                      "firstName",
                      "lastName",
                      "titleProfessions",
                      "img",
                    ],
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
    const {
      councilEventPanelId,
      status,
      UserId,
      isAddedByAdmin,
      isModerator,
      councilEventId,
    } = req.body;
    const { userTimezone } = req.query;

    try {
      if (status === "Join") {
        const councilEventPanel = await CouncilEventPanel.findOne({
          where: {
            id: councilEventPanelId,
          },
          include: [
            {
              model: CouncilEvent,
            },
          ],
        });

        if (!isAddedByAdmin) {
          const councilEventPanelistsCount = await CouncilEventPanelist.count({
            where: {
              CouncilEventPanelId: councilEventPanelId,
              isAddedByAdmin: "FALSE",
            },
          });

          const isFull =
            councilEventPanelistsCount >= councilEventPanel.numberOfPanelists;

          if (isFull) {
            return res
              .status(HttpCodes.INTERNAL_SERVER_ERROR)
              .json({ msg: "Internal server error" });
          }
        }

        const councilEvent = await CouncilEvent.findOne({
          where: {
            id: councilEventPanel.CouncilEvent.id,
          },
          include: [
            {
              model: CouncilEventPanel,
              include: [
                {
                  attributes: [],
                  model: CouncilEventPanelist,
                  where: {
                    UserId,
                  },
                },
              ],
            },
          ],
        });

        const maxNumberOfPanelsUsersCanJoin =
          councilEvent?.maxNumberOfPanelsUsersCanJoin || 0;

        const hasExceededMaxNumberOfPanelsUsersCanJoin =
          (councilEvent?.CouncilEventPanels?.length || 0) >=
          maxNumberOfPanelsUsersCanJoin;

        if (hasExceededMaxNumberOfPanelsUsersCanJoin) {
          return res.status(HttpCodes.ACCEPTED).json({
            msg: `You can only join up to ${maxNumberOfPanelsUsersCanJoin} panels.`,
          });
        }

        await CouncilEventPanelist.create({
          CouncilEventPanelId: councilEventPanelId,
          UserId,
          isModerator,
          isAddedByAdmin: !!isAddedByAdmin,
          CouncilEventId: councilEvent.id,
        });

        const user = await User.findOne({
          attributes: ["timezone", "firstName", "email"],
          where: {
            id: UserId,
          },
        });

        let _userTimezone;

        if (isAddedByAdmin) {
          _userTimezone = TimeZoneList.find(
            (item) => item.value === user.timezone
          );
        } else {
          _userTimezone = TimeZoneList.find((item) =>
            item.utc.includes(userTimezone)
          );
        }

        const timezone = TimeZoneList.find(
          (tz) => tz.value === councilEventPanel.CouncilEvent.timezone
        );
        const offset = timezone.offset;

        const startTime = councilEventPanel.startDate;
        const endTime = councilEventPanel.endDate;

        const convertedStartTime = convertToCertainTime(
          moment(startTime),
          councilEventPanel.CouncilEvent.timezone
        );

        const convertedEndTime = convertToCertainTime(
          moment(endTime),
          councilEventPanel.CouncilEvent.timezone
        );

        let icsContent;

        if (!isAddedByAdmin) {
          const localStartTime = convertToLocalTime(
            moment(convertedStartTime).utcOffset(offset, true)
            // _userTimezone.utc[0]
          );

          const localEndTime = convertToLocalTime(
            moment(convertedEndTime).utcOffset(offset, true)
            // _userTimezone.utc[0]
          );

          const calendarInvite = smtpService().generateCalendarInvite(
            localStartTime,
            localEndTime,
            councilEventPanel.panelName,
            `Link to join: ${councilEventPanel.linkToJoin}`,
            "",
            // event.location,
            "",
            "Hacking HR",
            process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
            _userTimezone.utc[0]
          );

          icsContent = calendarInvite.toString();
          icsContent = icsContent.replace(
            "BEGIN:VEVENT",
            `METHOD:REQUEST\r\nBEGIN:VEVENT`
          );
        }

        const event = {
          startDate: moment(councilEvent.startDate).format("LL"),
          endDate: moment(councilEvent.endDate).format("LL"),
          eventName: councilEvent.eventName,
        };

        const panel = {
          panelName: councilEventPanel.panelName,
          startDate: convertedStartTime.format("LL"),
          endDate: convertedEndTime.format("LL"),
          startTime: convertedStartTime.format("HH:mm"),
          endTime: convertedEndTime.format("HH:mm"),
          linkToJoin: councilEventPanel.linkToJoin,
        };

        let mailOptions = {
          // from: "hackinghrlab@gmail.com",
          from: process.env.SEND_IN_BLUE_SMTP_USER,
          to: user.email,
          subject: LabEmails.COUNCIL_EVENT_JOIN.subject(
            user.firstName,
            councilEventPanel.panelName,
            councilEvent.eventName
          ),
          html: isAddedByAdmin
            ? LabEmails.COUNCIL_EVENT_JOIN.addedByAdminBody(
                user.firstName,
                event,
                panel,
                timezone.abbr
              )
            : LabEmails.COUNCIL_EVENT_JOIN.body(
                user.firstName,
                event,
                panel,
                timezone.abbr
              ),
          contentType: "text/calendar",
        };

        // user joined, not added
        if (!isAddedByAdmin) {
          mailOptions["attachments"] = [
            {
              filename: `${councilEventPanel.panelName}.ics`,
              content: icsContent,
              contentType: "application/ics; charset=UTF-8; method=REQUEST",
              contentDisposition: "inline",
            },
          ];
        }

        smtpService().sendMailUsingSendInBlue(mailOptions);

        const councilEventPanelist = await CouncilEventPanelist.findOne({
          where: {
            CouncilEventPanelId: councilEventPanelId,
            UserId,
          },
          include: [
            {
              model: User,
              attributes: [
                "id",
                "firstName",
                "lastName",
                "titleProfessions",
                "img",
              ],
            },
          ],
        });

        if (!isEmpty(councilEventPanelist)) {
          const transformedCouncilEventPanelist = {
            ...councilEventPanelist.toJSON(),
            CouncilEventId: councilEvent.id,
            isJoining: true,
          };

          socketService().emit(
            SocketEventType.UPDATE_COUNCIL_EVENT_PANEL,
            transformedCouncilEventPanelist
          );
        }
      } else {
        await CouncilEventPanelist.destroy({
          where: {
            UserId,
            CouncilEventPanelId: councilEventPanelId,
          },
        });

        socketService().emit(SocketEventType.UPDATE_COUNCIL_EVENT_PANEL, {
          UserId,
          CouncilEventPanelId: councilEventPanelId,
          CouncilEventId: councilEventId,
        });
      }

      return res.status(HttpCodes.OK).json({});
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
        include: [
          {
            model: CouncilEvent,
          },
        ],
      });

      if (!councilEventPanel) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      const _userTimezone = TimeZoneList.find((item) =>
        item.utc.includes(userTimezone)
      );

      const timezone = TimeZoneList.find(
        (tz) => tz.value === councilEventPanel.CouncilEvent.timezone
      );
      const offset = timezone.offset;

      let startTime = councilEventPanel.startDate;
      let endTime = councilEventPanel.endDate;

      startTime = convertToCertainTime(
        moment(startTime),
        councilEventPanel.CouncilEvent.timezone
      );
      endTime = convertToCertainTime(
        moment(endTime),
        councilEventPanel.CouncilEvent.timezone
      );

      startTime = convertToLocalTime(moment(startTime).utcOffset(offset, true));
      endTime = convertToLocalTime(moment(endTime).utcOffset(offset, true));

      const calendarInvite = smtpService().generateCalendarInvite(
        startTime,
        endTime,
        councilEventPanel.panelName,
        "",
        "",
        // event.location,
        "",
        "Hacking HR",
        process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
        _userTimezone.utc[0]
      );

      let icsContent = calendarInvite.toString();
      icsContent = icsContent.replace(
        "BEGIN:VEVENT",
        `METHOD:REQUEST\r\nBEGIN:VEVENT`
      );

      console.log(icsContent, "bruv");

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

  const removePanelist = async (req, res) => {
    const { CouncilEventPanelistId, CouncilEventPanelId } = req.params;

    try {
      const councilEventPanelist = await CouncilEventPanelist.findOne({
        where: {
          id: CouncilEventPanelistId,
        },
        include: [
          {
            model: CouncilEventPanel,
          },
        ],
      });

      if (!councilEventPanelist) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      await CouncilEventPanelist.destroy({
        where: {
          id: CouncilEventPanelistId,
        },
      });

      socketService().emit(SocketEventType.UPDATE_COUNCIL_EVENT_PANEL, {
        UserId: councilEventPanelist.UserId,
        CouncilEventPanelId: councilEventPanelist.CouncilEventPanelId,
        CouncilEventId: councilEventPanelist.CouncilEventPanel.CouncilEventId,
      });

      return res.status(HttpCodes.OK).json({});
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const search = async (req, res) => {
    const { keyword } = req.query;

    let where = {};

    try {
      if (keyword) {
        where = {
          [Op.or]: [
            {
              firstName: {
                [Op.iLike]: `%${keyword}%`,
              },
            },
            {
              lastName: {
                [Op.iLike]: `%${keyword}%`,
              },
            },
            {
              email: {
                [Op.iLike]: `%${keyword}%`,
              },
            },
          ],
        };

        const users = await User.findAll({
          where,
          attributes: ["id", "firstName", "lastName", "email"],
        });

        return res.status(HttpCodes.OK).json({ users });
      }

      return res.status(HttpCodes.OK).json({ users: [] });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const upsertComment = async (req, res) => {
    const data = req.body;
    try {
      const [upsertedCouncilEventPanelComment, _] =
        await CouncilEventPanelComment.upsert(data);

      const councilEventPanelComment = await CouncilEventPanelComment.findOne({
        order: [["createdAt", "ASC"]],
        where: {
          id: upsertedCouncilEventPanelComment.id,
        },
        include: [
          {
            model: CouncilEventPanelist,
            attributes: ["id"],
            include: [
              {
                model: User,
                attributes: [
                  "id",
                  "firstName",
                  "lastName",
                  "titleProfessions",
                  "img",
                ],
              },
            ],
          },
        ],
      });

      const councilEvent = await CouncilEvent.findOne({
        attributes: ["id"],
        include: [
          {
            model: CouncilEventPanel,
            attributes: [],
            where: {
              id: councilEventPanelComment.CouncilEventPanelId,
            },
          },
        ],
      });

      const payload = {
        ...councilEventPanelComment.toJSON(),
        CouncilEventId: councilEvent.id,
      };

      if (!isEmpty(payload)) {
        socketService().emit(
          SocketEventType.UPDATE_COUNCIL_EVENT_COMMENTS,
          payload
        );
      }

      return res.status(HttpCodes.OK).json({});
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const reminderToAddQuestionAWeekBeforeTheEvent = async () => {
    const aWeekLaterStartOfHour = moment.utc().startOf("hour").add(1, "week");

    try {
      const councilEvents = await CouncilEvent.findAll({
        where: {
          startDate: aWeekLaterStartOfHour.format(),
          status: "active",
        },
      });

      councilEvents.forEach(async (councilEvent) => {
        const users = await User.findAll({
          attributes: ["id", "email", "firstName", "lastName"],
          include: [
            {
              model: CouncilEventPanelist,
              required: true,
              include: [
                {
                  model: CouncilEventPanel,
                  required: true,
                  where: {
                    CouncilEventId: councilEvent.id,
                  },
                },
              ],
            },
          ],
        });

        const timezone = TimeZoneList.find(
          (tz) => tz.value === councilEvent.timezone
        );

        const eventStartDate = moment.tz(
          councilEvent.startDate,
          timezone.utc[0]
        );
        const eventEndDate = moment.tz(councilEvent.endDate, timezone.utc[0]);

        transformedEvent = {
          startDate: eventStartDate.format("LL"),
          startTime: eventStartDate.format("HH:mm"),
          endDate: eventEndDate.format("LL"),
          endTime: eventEndDate.format("HH:mm"),
          eventName: councilEvent.eventName,
        };

        users.forEach((user) => {
          const panelists = user.CouncilEventPanelists;

          let transformedPanels = panelists
            .reverse()
            .map((panelist) => {
              const panel = panelist.CouncilEventPanel;

              const startDate = moment.tz(panel.startDate, timezone.utc[0]);
              const endDate = moment.tz(panel.endDate, timezone.utc[0]);

              const transformedPanels = `<p>${
                panel.panelName
              } on ${startDate.format("LL")} at ${startDate.format(
                "HH:mm"
              )} until ${endDate.format("LL")} at ${endDate.format(
                "HH:mm"
              )}</p>`;

              return transformedPanels;
            })
            .join("");

          const mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_USER,
            to: user.email,
            subject:
              LabEmails.REMINDER_TO_ADD_QUESTION_ONE_WEEK_BEFORE_THE_EVENT.subject(
                councilEvent.eventName
              ),
            html: LabEmails.REMINDER_TO_ADD_QUESTION_ONE_WEEK_BEFORE_THE_EVENT.body(
              user.firstName,
              transformedEvent,
              transformedPanels
            ),
            contentType: "text/html",
          };

          smtpService().sendMailUsingSendInBlue(mailOptions);
        });
      });
    } catch (error) {
      console.error(error);
    }
  };

  const remindToAddQuestionsAndRemindTheEventStartsTomorrow = async () => {
    const aDayBeforeStartOfHour = moment.utc().startOf("hour").add(1, "day");

    try {
      const councilEvents = await CouncilEvent.findAll({
        where: {
          startDate: aDayBeforeStartOfHour.format(),
          status: "active",
        },
      });

      councilEvents.forEach(async (event) => {
        const users = await User.findAll({
          attributes: ["id", "email", "firstName", "lastName"],
          include: [
            {
              model: CouncilEventPanelist,
              required: true,
              include: [
                {
                  model: CouncilEventPanel,
                  required: true,
                  where: {
                    CouncilEventId: event.id,
                  },
                },
              ],
            },
          ],
        });

        const timezone = TimeZoneList.find((tz) => tz.value === event.timezone);

        users.forEach((user) => {
          const panelists = user.CouncilEventPanelists;

          let transformedPanels = panelists
            .reverse()
            .map((panelist) => {
              const panel = panelist.CouncilEventPanel;

              const startDate = moment.tz(panel.startDate, timezone.utc[0]);
              const endDate = moment.tz(panel.endDate, timezone.utc[0]);

              const transformedPanels = `<p>${
                panel.panelName
              } on ${startDate.format("LL")} at ${startDate.format(
                "HH:mm"
              )} until ${endDate.format("LL")} at ${endDate.format(
                "HH:mm"
              )}</p>`;

              return transformedPanels;
            })
            .join("");

          const mailOptions = {
            from: process.env.SEND_IN_BLUE_SMTP_USER,
            to: user.email,
            subject:
              LabEmails.REMINDER_TO_ADD_QUESTION_ONE_DAY_BEFORE_THE_EVENT.subject(
                event.eventName
              ),
            html: LabEmails.REMINDER_TO_ADD_QUESTION_ONE_DAY_BEFORE_THE_EVENT.body(
              user.firstName,
              transformedPanels,
              event.eventName
            ),
            contentType: "text/html",
          };

          smtpService().sendMailUsingSendInBlue(mailOptions);
        });
      });
    } catch (error) {
      console.error(error);
    }
  };

  const remindPanelistOneHourBeforeTheEvent = async () => {
    const anHourBeforeStartOfHour = moment.utc().startOf("hour").add(1, "hour");

    try {
      const councilEventPanels = await CouncilEventPanel.findAll({
        where: {
          startDateStartOfHour: anHourBeforeStartOfHour.format(),
        },
        order: [["startDate", "ASC"]],
        include: [
          {
            model: CouncilEvent,
            attributes: ["timezone"],
            required: true,
            where: {
              status: "active",
            },
          },
          {
            model: CouncilEventPanelist,
            required: true,
            include: [
              {
                model: User,
                attributes: ["email", "firstName", "lastName"],
              },
            ],
          },
        ],
      });

      const councilEventPanelIds = councilEventPanels.map((panel) => panel.id);

      let councilEventPanelComments = councilEventPanelIds.map((id) =>
        CouncilEventPanelComment.findAll({
          where: {
            CouncilEventPanelId: id,
          },
          order: [["createdAt", "ASC"]],
          include: [
            {
              model: CouncilEventPanelist,
              include: [
                {
                  model: User,
                  attributes: ["firstName", "lastName", "email"],
                },
              ],
            },
          ],
        })
      );

      councilEventPanelComments = await Promise.all(councilEventPanelComments);

      if (!isEmpty(councilEventPanels)) {
        councilEventPanels.forEach((panel, index) => {
          const panelists = panel.CouncilEventPanelists;
          const event = panel.CouncilEvent;

          const transformedComments = councilEventPanelComments[index].map(
            (comment) => {
              const user = comment.CouncilEventPanelist.User;

              return `<li>${user.firstName} ${user.lastName}: ${comment.comment}</li>`;
            }
          );

          const timezone = TimeZoneList.find(
            (tz) => tz.value === event.timezone
          );

          const transformedPanel = {
            linkToJoin: panel.linkToJoin,
            panelName: panel.panelName,
            startTime: `${moment
              .tz(panel.startDate, timezone.utc[0])
              .format("HH:mm")} ${timezone.abbr}`,
          };

          let moderator = panelists.find((panelist) => panelist.isModerator);

          panelists.forEach((panelist) => {
            const user = panelist.User;

            const mailOptions = {
              from: process.env.SEND_IN_BLUE_SMTP_SENDER,
              to: user.email,
              subject:
                LabEmails.REMIND_PANELIST_ONE_HOUR_BEFORE_THE_EVENT_AND_ATTACH_ALL_COMMENTS.subject(
                  panel.panelName
                ),
              html: LabEmails.REMIND_PANELIST_ONE_HOUR_BEFORE_THE_EVENT_AND_ATTACH_ALL_COMMENTS.body(
                user.firstName,
                transformedPanel,
                transformedComments.join(""),
                `${moderator.User.firstName} ${moderator.User.lastName}`
              ),
              contentType: "text/html",
            };

            smtpService().sendMailUsingSendInBlue(mailOptions);
          });
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendDailyCommentToModerator = async () => {
    try {
      const dayBeforeStartOfDay = moment()
        .tz("America/Los_Angeles")
        .startOf("day")
        .subtract(1, "day");
      const dayBeforeEndOfDay = moment()
        .tz("America/Los_Angeles")
        .endOf("day")
        .subtract(1, "day");

      const councilEventPanels = await CouncilEventPanel.findAll({
        where: {
          startDateStartOfHour: {
            [Op.gt]: moment().tz("America/Los_Angeles").format(),
          },
        },
        order: [
          ["createdAt", "ASC"],
          [CouncilEventPanelComment, "createdAt", "ASC"],
        ],
        include: [
          {
            model: CouncilEvent,
            attributes: [],
            required: true,
            where: {
              status: "active",
            },
          },
          {
            model: CouncilEventPanelComment,
            required: true,
            where: {
              [Op.and]: [
                {
                  createdAt: {
                    [Op.gte]: dayBeforeStartOfDay,
                  },
                },
                {
                  createdAt: {
                    [Op.lte]: dayBeforeEndOfDay,
                  },
                },
              ],
            },
            include: [
              {
                model: CouncilEventPanelist,
                include: [
                  {
                    model: User,
                    attributes: ["firstName", "lastName"],
                  },
                ],
              },
            ],
          },
        ],
      });

      const councilEventPanelIds = councilEventPanels.map((panel) => panel.id);

      let councilEventPanelModerators = councilEventPanelIds.map((id) => {
        return CouncilEventPanelist.findAll({
          where: {
            CouncilEventPanelId: id,
            isModerator: "TRUE",
          },
          include: [
            {
              model: User,
              attributes: ["firstName", "email"],
            },
          ],
        });
      });

      councilEventPanelModerators = await Promise.all(
        councilEventPanelModerators
      );

      councilEventPanels.forEach((panel, index) => {
        const comments = panel.CouncilEventPanelComments.map((comment) => {
          const user = comment.CouncilEventPanelist.User;

          return `<p>${user.firstName} ${user.lastName}: ${comment.comment}</p>`;
        });

        let moderators = councilEventPanelModerators[index];
        moderators = moderators.map(
          (moderator) => moderator.toJSON().User.email
        );

        const mailOptions = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          to: `${moderators.join(", ")}`,
          subject: LabEmails.SEND_DAILY_COMMENTS_TO_MODERATOR.subject(
            panel.panelName
          ),
          html: LabEmails.SEND_DAILY_COMMENTS_TO_MODERATOR.body(
            comments.join("")
          ),
          contentType: "text/html",
        };

        smtpService().sendMailUsingSendInBlue(mailOptions);
      });
    } catch (error) {
      console.error(error);
    }
  };

  return {
    upsert,
    getAll,
    destroy,
    joinCouncilEventPanelist,
    downloadICS,
    removePanelist,
    search,
    upsertComment,
    reminderToAddQuestionAWeekBeforeTheEvent,
    remindToAddQuestionsAndRemindTheEventStartsTomorrow,
    remindPanelistOneHourBeforeTheEvent,
    sendDailyCommentToModerator,
  };
};

module.exports = CouncilEventController;
