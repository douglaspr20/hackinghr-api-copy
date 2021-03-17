const nodemailer = require("nodemailer");
const ical = require("ical-generator");
const { EmailContent } = require("../enum");

const smtpService = () => {
  const sendMail = async (mailOptions) => {
    return await new Promise((resolve, reject) => {
      /**
       * SMTP Transport template
       * {
       *   host: "smtp.example.com",
       *   port: 587,
       *   secure: false, // upgrade later with STARTTLS
       *   auth: {
       *     user: "username",
       *     pass: "password"
       *   }
       * }
       * https://nodemailer.com/smtp/
       */
      const transporter = nodemailer.createTransport({
        port: 587,
        host: process.env.AWS_SES_SMTP_HOST,
        secure: false,
        auth: {
          user: process.env.AWS_SES_SMTP_USERNAME,
          pass: process.env.AWS_SES_SMTP_PASSWORD
        },
        debug: false
      });

      /**
       * Message configuration (mailOptions)
       * {
       *   from: "sender@server.com",
       *   to: "receiver@sender.com",
       *   subject: "Message title",
       *   text: "Plaintext version of the message",
       *   html: "<p>HTML version of the message</p>"
       * };
       * https://nodemailer.com/message/
       */

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(`smtpService Error: ${err}`);
          resolve(false);
        } else {
          console.log(`smtpService Response: ${info.response}`);
          resolve(true);
        }
      });
    });
  };

  const generateCalendarInvite = (
    startTime,
    endTime,
    summary,
    description,
    location,
    url,
    name,
    email,
    timezone
  ) => {
    const cal = ical({ domain: process.env.DOMAIN_URL, name: "invite" });

    cal.domain(process.env.DOMAIN_URL);

    const eventObject = {
      start: startTime,
      end: endTime,
      summary: summary,
      description: description,
      location: location,
      url: url,
      organizer: {
        name,
        email,
      },
      timezone,
    };

    console.log("**** eventObject ", eventObject);

    cal.createEvent(eventObject);

    return cal;
  };

  const sendMatchEvent = async (source, target, isMentor) => {
    const mailOptions = {
      from: process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
      to: `${source.email}, ${target.email}`,
      subject: `Mentor and Mentee!`,
      html: isMentor
        ? EmailContent.MENTOR_EMAIL(source, target)
        : EmailContent.MENTEE_EMAIL(source, target),
    };

    console.log("**** mailOptions ", mailOptions);

    const sentResult = await smtpService().sendMail(mailOptions);

    return sentResult;
  };

  return {
    sendMail,
    generateCalendarInvite,
    sendMatchEvent,
  };
};

module.exports = smtpService;
