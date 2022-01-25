const db = require("../models");
const { Op } = require("sequelize");
const s3Service = require("../services/s3.service");
const moment = require("moment-timezone");
const { LabEmails } = require("../enum");
const smtpService = require("../services/smtp.service");

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

      // users = users.map((user) => user.email);
      //  "enrique@hackinghr.io"
      const users = ["lourencelinao13@gmail.com"];

      const podcastsEmailContent = podcasts.map((podcast) => {
        const link = `${process.env.DOMAIN_URL}library-item/podcast/${podcast.id}?channel=${podcast.channel}`;
        return `
          <li>
            <a href="${link}" target="_blank">${podcast.title}</a>
          </li>
        `;
      });

      const contentsEmailContent = contents.map((content) => {
        return `
          <li>
            <a href="${content.link}" target="_blank">${content.title}</a>
          </li>
        `;
      });

      const jobPostsEmailContent = jobPosts.map((jobPost) => {
        const link = `${process.env.DOMAIN_URL}talent-marketplace/job-post/${jobPost.id}`;
        return `
          <li>
            <a href="${link}" target="_blank">${jobPost.jobTitle} - ${jobPost.salaryRange}</a>
          </li>
        `;
      });

      const promiseToBeResolved = users.map((email) => {
        const mailOptions = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          to: email,
          subject: LabEmails.WEEKLY_DIGEST.subject(),
          html: LabEmails.WEEKLY_DIGEST.body(
            podcastsEmailContent,
            contentsEmailContent,
            jobPostsEmailContent
          ),
          contentType: "text/html",
        };

        return smtpService().sendMailUsingSendInBlue(mailOptions);
      });

      await Promise.all(promiseToBeResolved);
    } catch (error) {
      console.log(error);
    }
  };

  return {
    sendWeeklyDigestEmail,
  };
};

module.exports = WeeklyDigestController;
