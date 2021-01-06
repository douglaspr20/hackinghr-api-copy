const HttpCodes = require("http-codes");
const smtpService = require("../services/smtp.service");

const FeedbackController = () => {
  const sendMail = async (req, res) => {
    const { message } = req.body;

    if (message) {
      try {
        const smtpTransort = {
          host: process.env.FEEDBACK_EMAIL_CONFIG_HOST,
          port: process.env.FEEDBACK_EMAIL_CONFIG_PORT,
          auth: {
            user: process.env.FEEDBACK_EMAIL_CONFIG_USER,
            pass: process.env.FEEDBACK_EMAIL_CONFIG_PASSWORD
          }
        };
        const mailOptions = {
          from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
          to: process.env.FEEDBACK_EMAIL_CONFIG_RECEIVER,
          subject: process.env.FEEDBACK_EMAIL_CONFIG_SUBJECT,
          text: message,
        };
        const sentResult = await smtpService().sendMail(smtpTransort, mailOptions);
        if (sentResult) {
          return res
            .status(HttpCodes.OK)
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
      .json({ msg: "Bad Request: message is empty" });
  };

  return {
    sendMail,
  };
};

module.exports = FeedbackController;
