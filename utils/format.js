const moment = require("moment-timezone");
const TimeZoneList = require("../enum/TimeZoneList");

function convertToCertainTime(date, tz) {
  let res = moment();
  const timezone = TimeZoneList.find((item) => item.value === tz);

  if (timezone) {
    res = moment.utc(date).tz(timezone.utc[0]);
  } else {
    res = moment(date);
  }

  return res;
}

function getEventPeriod(date, date2, timezone) {
  let res = "";
  const startDate = convertToCertainTime(date, timezone);
  const endDate = convertToCertainTime(date2, timezone);
  let tz = TimeZoneList.find((item) => item.value === timezone);
  tz = (tz || {}).abbr || "";

  if (
    startDate.year() === endDate.year() &&
    startDate.month() === endDate.month() &&
    startDate.date() === endDate.date()
  ) {
    res = `${startDate.format("MMM-DD")}, from ${startDate.format(
      "h:mm a"
    )} - ${endDate.format("h:mm a")}, ${tz}`;
  } else {
    res = `${date.format("h:mm a")} - ${date2.format(
      "YYYY-MM-DD h:mm a"
    )} ${tz}`;
  }

  return res;
}

module.exports = { getEventPeriod, convertToCertainTime };
