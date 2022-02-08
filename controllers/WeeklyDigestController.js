const db = require("../models");
const { Op } = require("sequelize");
const moment = require("moment-timezone");
const sendInBlueService = require("../services/sendinblue.service");
const { JOB_BOARD } = require("../enum");

const Podcast = db.Podcast;
const Library = db.Library;
const JobPost = db.JobPost;
const User = db.User;

const WeeklyDigestController = () => {
  const getThisWeeksPodcastsByCreators = async (
    dateToday,
    dateSevenDaysFromDateToday
  ) => {
    try {
      const podcasts = await Podcast.findAll({
        attributes: ["id", "title", "channel"],
        where: {
          channel: {
            [Op.ne]: null,
          },
          [Op.and]: [
            {
              dateEpisode: {
                [Op.lte]: dateToday,
              },
            },
            {
              dateEpisode: {
                [Op.gte]: dateSevenDaysFromDateToday,
              },
            },
          ],
        },
        raw: true,
      });

      return podcasts;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const getThisWeeksContentFromCreators = async (
    dateToday,
    dateSevenDaysFromDateToday
  ) => {
    try {
      const contents = await Library.findAll({
        attributes: ["title", "link"],
        where: {
          channel: {
            [Op.ne]: null,
          },
          [Op.and]: [
            {
              createdAt: {
                [Op.lte]: dateToday,
              },
            },
            {
              createdAt: {
                [Op.gte]: dateSevenDaysFromDateToday,
              },
            },
          ],
        },
        raw: true,
      });

      return contents;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const getActiveJobPosts = async () => {
    try {
      const jobPosts = await JobPost.findAll({
        where: {
          status: "active",
        },
        raw: true,
      });

      return jobPosts;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const sendWeeklyDigestEmail = async () => {
    const dateToday = moment()
      .tz("America/Los_Angeles")
      .startOf("day")
      .utc()
      .format("YYYY-MM-DD");

    const dateSevenDaysFromDateToday = moment()
      .tz("America/Los_Angeles")
      .startOf("day")
      .utc()
      .subtract(6, "day")
      .format("YYYY-MM-DD");

    try {
      const podcasts = await getThisWeeksPodcastsByCreators(
        dateToday,
        dateSevenDaysFromDateToday
      );
      const contents = await getThisWeeksContentFromCreators(
        dateToday,
        dateSevenDaysFromDateToday
      );
      const jobPosts = await getActiveJobPosts();

      // let users = await User.findAll({
      //   attributes: ["email"],
      //   raw: true,
      // });

      // users = users.map((user) => {
      //   email: user.email;
      // });

      //  "enrique@hackinghr.io"
      const users = [
        {
          email: "lourencelinao13@gmail.com",
        },
        {
          email: "enrique@hackinghr.io",
        },
      ];

      const podcastsEmailContent = podcasts.map((podcast) => {
        const link = `${process.env.DOMAIN_URL}library-item/podcast/${podcast.id}?channel=${podcast.channel}`;

        return {
          title: podcast.title,
          link,
        };
      });

      const contentsEmailContent = contents.map((content) => {
        return {
          title: content.title,
          link: content.link,
        };
      });

      const resources = [...podcastsEmailContent, ...contentsEmailContent];

      const jobs = jobPosts.map((jobPost) => {
        const formattedLocation = jobPost.location
          .map((location) => {
            const data = JOB_BOARD.LOCATIONS.find(
              (loc) => loc.value === location
            );

            return data.text;
          })
          .join("/");

        const link = `${process.env.DOMAIN_URL}talent-marketplace/job-post/${jobPost.id}`;

        return {
          title: jobPost.jobTitle,
          salary: jobPost.salaryRange,
          location: formattedLocation,
          level: jobPost.level,
          link,
        };
      });

      await sendInBlueService().sendWeeklyDigest(users, jobs, resources);
    } catch (error) {
      console.log(error);
    }
  };

  return {
    sendWeeklyDigestEmail,
  };
};

module.exports = WeeklyDigestController;
