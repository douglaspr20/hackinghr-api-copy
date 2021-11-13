const moment = require("moment-timezone");
const smtpService = require("../services/smtp.service");

const googleCalendar = (item, startDate, endDate, tz) => {
  const convertedStartTime = moment.utc(startDate).tz(tz).local();

  const convertedEndTime = moment.utc(endDate).tz(tz).local();

  let googleCalendarUrl = `http://www.google.com/calendar/event?action=TEMPLATE&text=${
    item.title
  }&dates=${convertedStartTime.format(
    "YYYYMMDDTHHmm"
  )}/${convertedEndTime.format("YYYYMMDDTHHmm")}&details=${
    item.description
  }&location=${
    item.link
  }&trp=false&sprop=https://www.hackinghrlab.io/&sprop=name:`;

  console.log(googleCalendarUrl);
  return googleCalendarUrl;
};
const yahooCalendar = (item, startDate, endDate, tz) => {
  const convertedStartTime = moment.utc(startDate).tz(tz).local();

  const convertedEndTime = moment.utc(endDate).tz(tz).local();

  let yahooCalendarUrl = `http://calendar.yahoo.com/?v=60&type=10&title=${
    item.title
  }&st=${convertedStartTime.format(
    "YYYYMMDDTHHmm"
  )}&dur${convertedEndTime.format("HHmmss")}&details=${
    item.description
  }&location=${item.link}`;
  return yahooCalendarUrl;
};

const generateIcsCalendar = (item, startDate, endDate, tz) => {
  const convertedStartTime = moment.utc(startDate).tz(tz).local();

  const convertedEndTime = moment.utc(endDate).tz(tz).local();

  return smtpService().generateCalendarInvite(
    convertedStartTime.format("YYYY-MM-DD h:mm a"),
    convertedEndTime.format("YYYY-MM-DD h:mm a"),
    item.title,
    item.description,
    "https://www.hackinghrlab.io/global-conference",
    `${process.env.DOMAIN_URL}${item.id}`,
    "hacking Lab HR",
    process.env.FEEDBACK_EMAIL_CONFIG_SENDER,
    tz
  );
};

module.exports = {
  googleCalendar,
  yahooCalendar,
  generateIcsCalendar,
};
