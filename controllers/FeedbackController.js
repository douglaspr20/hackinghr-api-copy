const db = require("../models");
const HttpCodes = require("http-codes");
const smtpService = require("../services/smtp.service");

const User = db.User;

const FeedbackController = () => {
  const sendMail = async (req, res) => {
    const { message } = req.body;
    const { id: userId } = req.token;

    if (message && userId) {
      try {
        let user = await User.findOne({
          where: {
            id: userId,
          },
        });
        usre = user.toJSON();
        const mailOptions = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          to: process.env.FEEDBACK_EMAIL_CONFIG_RECEIVER,
          subject: process.env.FEEDBACK_EMAIL_CONFIG_SUBJECT,
          html: `
            <strong>User</strong>: ${user.firstName} ${user.lastName}<br>
            <strong>e-Mail</strong>: ${user.email}<br>
            <strong>Feedback message</strong>:<br>
            ${message}
          `,
        };
        const sentResult = await smtpService().sendMailUsingSendInBlue(
          mailOptions
        );

        if (sentResult) {
          return res
            .status(HttpCodes.OK)
            .json({ msg: "The mail has been sent successfully." })
            .send();
        } else {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }
      } catch (err) {
        console.log(err);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }

    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: message or userId are empty" });
  };

  return {
    sendMail,
  };
};

module.exports = FeedbackController;
