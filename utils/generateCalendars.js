const { convertToCertainTime } = require("./format");

const googleCalendar = (item, tz) => {
  let googleCalendarUrl = `http://www.google.com/calendar/event?action=TEMPLATE&text=${
    item.title
  }&dates=${convertToCertainTime(item.startTime, tz).format(
    "YYYYMMDDTHHmm"
  )}/${convertToCertainTime(item.endTime, tz).format(
    "YYYYMMDDTHHmmss"
  )}&details=${
    item.description
  }&location=https://www.hackinghrlab.io/global-conference&trp=false&sprop=https://www.hackinghrlab.io/&sprop=name:`;
  return googleCalendarUrl;
};
const yahooCalendar = (item, tz) => {
  let yahooCalendarUrl = `http://calendar.yahoo.com/?v=60&type=10&title=${
    item.title
  }&st=${convertToCertainTime(item.startTime, tz).format(
    "YYYYMMDDTHHmm"
  )}&dur${convertToCertainTime(item.endTime, tz).format("HHmmss")}&details=${
    item.description
  }&location=https://www.hackinghrlab.io/global-conference`;
  return yahooCalendarUrl;
};

module.exports = {
  googleCalendar,
  yahooCalendar,
};
