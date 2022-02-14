const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mapRoutes = require("express-routes-mapper");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const authPolicy = require("./policies/auth.policy");
const { isEmpty } = require("lodash");
const cron = require("node-cron");
const EventController = require("./controllers/EventController");
// const JourneyController = require("./controllers/JourneyController");
const fileUpload = require("express-fileupload");
const SkillCohortResourcesController = require("./controllers/SkillCohortResourcesController");
const SkillCohortParticipantController = require("./controllers/SkillCohortParticipantController");
const NotificationController = require("./controllers/NotificationController");
const SkillCohortGroupingsController = require("./controllers/SkillCohortGroupingsController");
const SkillCohortController = require("./controllers/SkillCohortController");
const SkillCohortResourceResponseController = require("./controllers/SkillCohortResourceResponseController");
const SkillCohortResourceResponseAssessmentController = require("./controllers/SkillCohortResourceResponseAssessmentController");
const JobPostController = require("./controllers/JobPostController");
const WeeklyDigestController = require("./controllers/WeeklyDigestController");

const moment = require("moment-timezone");

const { LabEmails } = require("./enum");

const smtpService = require("./services/smtp.service");
const socketService = require("./services/socket.service");

dotenv.config();

/**
 * server configuration
 */
const routes = require("./routes");

/**
 * express application
 */
const app = express();
const mappedOpenRoutes = mapRoutes(routes.publicRoutes, "controllers/");
const mappedAuthRoutes = mapRoutes(routes.privateRoutes, "controllers/", [
  authPolicy.validate,
]);
const mappedAdminRoutes = mapRoutes(routes.adminRoutes, "controllers/", [
  authPolicy.validate,
  authPolicy.checkAdminRole,
]);

// Creating a cron job which runs on every an hour.
cron.schedule("25 * * * *", () => {
  console.log("running a task every 1 hour.");
  EventController().emailAfterEventThread();
});

// Creating a cron job which runs on every day.
// TO DO: Journey process will be reimplement.
/*cron.schedule("* 0 * * *", () => {
  console.log("running a task every 1 day.");
  JourneyController().createNewItems();
});
*/

// cron job that resets the assessment and comment strike to 0
cron.schedule(
  "0 0 * * 1", // 12AM every monday
  async () => {
    console.log(
      "****************Running task at 12AM everyday****************"
    );
    console.log("****************Reset Counter****************");
    await SkillCohortParticipantController().resetCounter();
  },
  {
    timezone: "America/Los_Angeles",
  }
);

// Checks if participants have responded to a resource and kick them if they didn't
cron.schedule(
  "45 23 * * 7", //sunday 11 pm
  async () => {
    for (let i = 6; i >= 0; i--) {
      let cohortCtr = 0;

      const date = moment()
        .tz("America/Los_Angeles")
        .startOf("day")
        .utc()
        .subtract(i, "day")
        .format("YYYY-MM-DD HH:mm:ssZ");

      const allActiveSkillCohortsWithYesterdayResource =
        await SkillCohortController().getAllActiveSkillCohortsWithResource(
          date
        );

      let jaggedParticipants =
        await SkillCohortParticipantController().getAllParticipantsByListOfSkillCohort(
          allActiveSkillCohortsWithYesterdayResource
        );

      jaggedParticipants.map((participants) => {
        participants.map(async (participant) => {
          const skillCohort =
            allActiveSkillCohortsWithYesterdayResource[cohortCtr];

          const hasResponded =
            await SkillCohortResourceResponseController().checkIfParticipantHasRespondedToTheResource(
              skillCohort,
              participant
            );

          if (!hasResponded) {
            if (participant.numberOfCommentStrike >= 1) {
              await SkillCohortParticipantController().removeParticipantAccess(
                participant,
                skillCohort.id
              );
            } else {
              await SkillCohortParticipantController().incrementCommentStrike(
                participant,
                skillCohort.id
              );
            }
          }
        });
        cohortCtr++;
      });

      // const allActiveSkillCohortsWithDayBeforeYesterdayResource =
      //   await SkillCohortController().getAllActiveSkillCohortsWithResource(
      //     date
      //   );

      // cohortCtr = 0;

      // jaggedParticipants =
      //   await SkillCohortParticipantController().getAllParticipantsByListOfSkillCohort(
      //     allActiveSkillCohortsWithYesterdayResource
      //   );

      // jaggedParticipants.map((participants) => {
      //   participants.map(async (participant) => {
      //     const skillCohort =
      //       allActiveSkillCohortsWithDayBeforeYesterdayResource[cohortCtr];

      //     const hasAssessed =
      //       await SkillCohortResourceResponseAssessmentController().checkIfParticipantHasAssessedOtherComments(
      //         skillCohort,
      //         participant
      //       );

      //     if (!hasAssessed) {
      //       await SkillCohortParticipantController().incrementAssessmentStrike(
      //         participant,
      //         skillCohort.id
      //       );
      //     }
      //   });
      //   cohortCtr++;
      // });
    }
  },
  {
    timezone: "America/Los_Angeles",
  }
);

// cron job that notifies a cohort participants that a resource for the day is available through notification and email
cron.schedule(
  "0 2 * * *", // 2AM everyday
  async () => {
    console.log("running a task every 2 AM.");
    console.log("****************Notification****************");
    const skillCohortResources =
      await SkillCohortResourcesController().getResourcesToBeReleasedToday();

    const jaggedListOfParticipants =
      await SkillCohortParticipantController().getAllParticipantsByListOfSkillCohortResources(
        skillCohortResources
      );

    const notifications = skillCohortResources.map((resource, indx) => {
      let participantIds = jaggedListOfParticipants[indx].map(
        (participants) => {
          return participants.UserId;
        }
      );

      if (isEmpty(participantIds)) {
        participantIds = [-2];
      }

      return NotificationController().createNotification({
        message: `${resource.SkillCohort.title} - New resource available`,
        type: "resource",
        meta: resource,
        onlyFor: participantIds,
      });
    });

    await Promise.all(notifications);

    const emailToBeSent = jaggedListOfParticipants.map((participants) => {
      return participants.map((participant) => {
        const cohort = participant.SkillCohort;
        const resource = skillCohortResources.find((resource) => {
          return resource.SkillCohortId === cohort.id;
        });

        const user = participant.User;

        const mailOptions = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          to: participant.User.email,
          subject: LabEmails.DAILY_RESOURCE.subject(cohort, resource),
          html: LabEmails.DAILY_RESOURCE.body(user, cohort, resource),
          contentType: "text/html",
        };

        return smtpService().sendMailUsingSendInBlue(mailOptions);
      });
    });

    await Promise.all(emailToBeSent.flat());
  },
  {
    timezone: "America/Los_Angeles",
  }
);

cron.schedule(
  "0 3 * * 1", // 3AM Monday
  async () => {
    console.log("****************Grouping****************");
    await SkillCohortGroupingsController().createSkillCohortGroups();
  },
  {
    timezone: "America/Los_Angeles",
  }
);

cron.schedule(
  "0 4 * * *", // 4AM Everyday
  async () => {
    console.log(
      "****************Send Emails To Participants That A Cohort Will Start At Exactly 1 Week From Now****************"
    );
    let skillCohorts =
      await SkillCohortController().getAllSkillCohortThatWillStartWeekLater();

    let emailsToBeSent = [];

    skillCohorts.map((cohort) => {
      const participants = cohort.SkillCohortParticipants;

      const startDate = moment(cohort.startDate).format("LL");

      participants.map((participant) => {
        participant = participant.dataValues;

        const mailOptions = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          to: participant.User.email,
          subject:
            LabEmails.SKILL_COHORT_EMAIL_ONE_WEEK_BEFORE_IT_STARTS.subject(
              cohort,
              startDate
            ),
          html: LabEmails.SKILL_COHORT_EMAIL_ONE_WEEK_BEFORE_IT_STARTS.body(
            participant.User,
            cohort
          ),
          contentType: "text/html",
        };

        const email = smtpService().sendMailUsingSendInBlue(mailOptions);

        emailsToBeSent.push(email);
      });
    });

    await Promise.all(emailsToBeSent);

    console.log(
      "****************Send Emails To Participants That A Cohort Will Start At Exactly 1 Week From Now****************"
    );
    skillCohorts =
      await SkillCohortController().getAllSkillCohortThatWillStartTomorrow();

    emailsToBeSent = [];

    skillCohorts.map((cohort) => {
      const participants = cohort.SkillCohortParticipants;

      const startDate = moment(cohort.startDate).format("LL");
      const endDate = moment(cohort.endDate).format("LL");

      let location = participants.map((participant) => {
        participant = participant.dataValues;
        const user = participant.User.dataValues;

        return user.location;
      });

      location = [...new Set(location)];

      participants.map((participant) => {
        participant = participant.dataValues;

        const mailOptions = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          to: participant.User.email,
          subject: LabEmails.SKILL_COHORT_EMAIL_DAY_BEFORE_IT_STARTS.subject(
            cohort,
            startDate
          ),
          html: LabEmails.SKILL_COHORT_EMAIL_DAY_BEFORE_IT_STARTS.body(
            participant.User,
            cohort,
            startDate,
            endDate,
            participants.length,
            location.length
          ),
          contentType: "text/html",
        };

        const email = smtpService().sendMailUsingSendInBlue(mailOptions);

        emailsToBeSent.push(email);
      });
    });

    await Promise.all(emailsToBeSent);
  },
  {
    timezone: "America/Los_Angeles",
  }
);

// Job Post Auto Expiry
cron.schedule(
  "0 0 * * *", // 12AM every day
  async () => {
    console.log(
      "****************Running task at 12AM everyday****************"
    );
    console.log("****************Auto Expiry****************");
    await JobPostController().jobPostAutoExpiry();
  },
  {
    timezone: "America/Los_Angeles",
  }
);

// Weekly Digest
// cron.schedule(
//   "0 0 * * *", // 12AM every day
//   // "0 0 * * 5", // 12AM every Friday
//   async () => {
//     console.log(
//       "****************Running task at 12AM everyday****************"
//     );
//     console.log("****************Weekly Digest****************");
//     await WeeklyDigestController().sendWeeklyDigestEmail();
//   },
//   {
//     timezone: "America/Los_Angeles",
//   }
// );

// allow cross origin requests
// configure to only allow requests from certain origins
app.use(cors());

// parsing the request bodys
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

// parsing file uploaded
app.use(
  fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 },
  })
);

// secure your private routes with jwt authentication middleware
// app.all('/private/*', (req, res, next) => auth(req, res, next));

// fill routes for express application
app.use("/public", mappedOpenRoutes);
app.use("/private", mappedAuthRoutes);
app.use("/admin", mappedAdminRoutes);

const port = process.env.PORT || 3001;

const server = http.createServer(app);

const FEUrl = process.env.DOMAIN_URL || "http://localhost:3000/";

const io = socketIo(server, {
  cors: {
    origin: [
      FEUrl.slice(0, FEUrl.length - 1),
      FEUrl.slice(0, FEUrl.length - 1).replace("www.", ""),
    ],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socketService().addSocket(socket);

  socket.on("disconnect", () => {
    socketService().removeSocket(socket);
  });

  socket.on("error", (error) => {
    console.log(`Socket IO Error:`, error);
  });
});

server.listen(port, () =>
  console.log(`url-shortener listening on port ${port}!`)
);
