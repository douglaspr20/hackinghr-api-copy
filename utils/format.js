const moment = require("moment-timezone");
const TimeZoneList = require("../enum/TimeZoneList");
const { Parser } = require("json2csv");
const isEmpty = require("lodash/isEmpty");
const Excel = require("exceljs");

const workbook = new Excel.Workbook();

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

function convertToUserTimezone(date, tz) {
  let res = moment();

  const timezone = TimeZoneList.find((item) => item.utc.includes(tz));

  if (timezone) {
    res = moment(date).tz(timezone.utc[0]);
  } else {
    res = moment(date);
  }

  return res;
}

function convertToLocalTime(date) {
  const localTimezone = moment.tz.guess();

  return moment.utc(date).tz(localTimezone);
}

function convertToUTCTime(date, tz) {
  let res = moment(date).format("YYYY-MM-DD h:mm a");

  const timezone = TimeZoneList.find((item) => item.value === tz);

  if (timezone) {
    res = moment.tz(res, "YYYY-MM-DD h:mm a", timezone.utc[0]).utc().format();
  } else {
    const localTimezone = moment.tz.guess();
    res = moment.tz(res, "YYYY-MM-DD h:mm a", localTimezone).format();
  }

  return res;
}

function getEventPeriod(date, startAndEndTimes, timezone) {
  let tz = TimeZoneList.find((item) => item.value === timezone);

  return startAndEndTimes.map((time, index) => {
    const startTime = convertToCertainTime(
      moment(time.startTime).utcOffset(tz.offset, true),
      timezone
    );
    const endTime = convertToCertainTime(
      moment(time.endTime).utcOffset(tz.offset, true),
      timezone
    );

    console.log(startTime, endTime);

    return `
        <br> ${moment(date).format("LL")} | ${moment(startTime).format(
      "HH:mm"
    )} - ${moment(endTime).format("HH:mm")} ${tz.abbr}
      `;
  });
}

function convertJSONToCSV(content) {
  if (content && !isEmpty(content)) {
    const fields = Object.keys(content[0]);

    return new Parser({ fields }).parse(content);
  }

  return null;
}

async function convertJSONToExcel(sheet, fields, content) {
  // Create page
  console.log("***** content", content);
  const ws1 = workbook.addWorksheet(sheet);
  ws1.addRow(fields.map((item) => item.label));
  fields.forEach((field, index) => {
    ws1.getColumn(index + 1).width = field.width;
  });

  content.forEach((item) => {
    const row = fields.map((field) => item[field.value]);
    ws1.addRow(row);
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
}

module.exports = {
  getEventPeriod,
  convertToCertainTime,
  convertToLocalTime,
  convertToUTCTime,
  convertJSONToCSV,
  convertJSONToExcel,
  convertToUserTimezone,
};
