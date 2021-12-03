const moment = require("moment-timezone");
const smtpService = require("../services/smtp.service");

const googleCalendar = (item, tz) => {
  const convertedStartTime = moment.utc(item.startTime).tz(tz);

  const convertedEndTime = moment.utc(item.endTime).tz(tz);

  console.log(item);

  let googleCalendarUrl = `http://www.google.com/calendar/event?action=TEMPLATE&text=${encodeURIComponent(
    item.title
  )}&dates=${convertedStartTime.format(
    "YYYYMMDDTHHmm"
  )}/${convertedEndTime.format("YYYYMMDDTHHmm")}&details=${encodeURIComponent(
    item.description
  )}&location=${
    item.link
  }&trp=false&sprop=https://www.hackinghrlab.io/&sprop=name:`;
  return googleCalendarUrl;
};
const yahooCalendar = (item, tz) => {
  const convertedStartTime = moment.utc(item.startTime).tz(tz);

  const convertedEndTime = moment.utc(item.endTime).tz(tz);

  let yahooCalendarUrl = `https://calendar.yahoo.com/?v=60&st=${convertedStartTime.format(
    "YYYYMMDDTHHmm"
  )}&et=${convertedEndTime.format("YYYYMMDDTHHmm")}&title=${encodeURIComponent(
    item.title
  )}&desc=${encodeURIComponent(
    item.description
  )}&in_loc=https://www.hackinghrlab.io/global-conference`;
  return yahooCalendarUrl;
};

const generateIcsCalendar = (item, tz) => {
  const convertedStartTime = moment.utc(item.startTime).tz(tz);

  const convertedEndTime = moment.utc(item.endTime).tz(tz);

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
