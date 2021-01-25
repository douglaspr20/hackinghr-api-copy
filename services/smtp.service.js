const nodemailer = require("nodemailer");
const ical = require("ical-generator");

const smtpService = () => {
  const sendMail = async (smtpTransort, mailOptions) => {
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
      const transporter = nodemailer.createTransport(smtpTransort);

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

  return {
    sendMail,
    generateCalendarInvite,
  };
};

module.exports = smtpService;
