const moment = require("moment-timezone");
const TimeZoneList = require("../enum/TimeZoneList");
const { Parser } = require("json2csv");
const isEmpty = require("lodash/isEmpty");

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

function convertToLocalTime(date) {
  const localTimezone = moment.tz.guess();

  return moment.utc(date).tz(localTimezone);
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
    res = `${startDate.format("MMM DD")}, from ${startDate.format(
      "h:mm a"
    )} to ${endDate.format("h:mm a")}, ${tz}`;
  } else {
    res = `${startDate.format("YYYY-MM-DD h:mm a")} - ${endDate.format(
      "YYYY-MM-DD h:mm a"
    )} ${tz}`;
  }

  return res;
}

function convertJSONToCSV(content) {
  if (content && !isEmpty(content)) {
    const fields = Object.keys(content[0]);

    return new Parser({ fields }).parse(content);
  }

  return null;
}

module.exports = {
  getEventPeriod,
  convertToCertainTime,
  convertToLocalTime,
  convertJSONToCSV,
};
