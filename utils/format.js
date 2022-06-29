const moment = require("moment-timezone");
const TimeZoneList = require("../enum/TimeZoneList");
const { Parser } = require("json2csv");
const isEmpty = require("lodash/isEmpty");
const path = require("path")
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

function convertToLocalTime(date, localTz = null) {
  let localTimezone;

  if (localTz) {
    localTimezone = localTz;
  } else {
    localTimezone = moment.tz.guess();
  }

  console.log("localTimezone", localTimezone);

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
    const day = moment.tz(time.startTime, tz.utc[0]);
    const startTime = moment.tz(time.startTime, tz.utc[0]);
    const endTime = moment.tz(time.endTime, tz.utc[0]);

    return `
        <br> ${moment(day).format("LL")} | ${moment(startTime).format(
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


async function convertJSONToExcelUsersSpeakers2023(sheet, fields, content) {

  // Create page
  const wb = workbook.addWorksheet(sheet);
  wb.addRow(fields.map((item) => item.label));
  fields.forEach((field, index) => {
    wb.getColumn(index + 1).width = field.width;
  });

  content.forEach((item) => {
    const row = fields.map((field) => item[field.value]);
    wb.addRow(row);
  });

  await workbook.xlsx.writeFile(`./utils/${sheet}.xlsx`);

  return;
}

async function convertJSONToExcelPanelsConference2023(sheet, fields1, fields2, content) {

  const wb = workbook.addWorksheet(sheet);

  let number = 2
  let number2 = 0
  const cell1 = wb.getCell(`A1`);
  cell1.value = 'Sessions';

  fields2.forEach((field, index) => {
    wb.getColumn(index + 1).width = field.width;
  });

  content.forEach((item) => {

    const cell2 = wb.getCell(`A${number}`);
    cell2.value = '';
    wb.getRow(`${number}`).fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor:{argb:'c0c0c0'},
    }

    const row1 = fields1.map((item) => item.label)
    wb.addRow(row1,`${number+1}`);
    wb.getRow(`${number+1}`).fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor:{argb:'c6e9e8'},
    }
    wb.getRow(`${number+1}`).border = {
      top: {style:'thin'},
      left: {style:'thin'},
      bottom: {style:'thin'},
      right: {style:'thin'}
    };

    const row2 = fields1.map((field) => item[field.value]);
    wb.addRow(row2,`${number+2}`);
    wb.getRow(`${number+2}`).fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor:{argb:'c6e9e8'},
    }
    wb.getRow(`${number+2}`).border = {
      top: {style:'thin'},
      left: {style:'thin'},
      bottom: {style:'thin'},
      right: {style:'thin'}
    };
    
    wb.addRow(fields2.map((item) => item.label), `${number+3}`);
    item.SpeakerMemberPanels.forEach((item,index) => {
      const row = fields2.map((field) => item.User[field.value]);
      wb.addRow(row,`${number+4+index}`);
    });
    
    number2 = (Number(item.SpeakerMemberPanels.length) !== 0) ? Number(item.SpeakerMemberPanels.length) : 1

    number = number + 4 + number2
  });

  await workbook.xlsx.writeFile(`./utils/${sheet}.xlsx`);

  return;
}


module.exports = {
  getEventPeriod,
  convertToCertainTime,
  convertToLocalTime,
  convertToUTCTime,
  convertJSONToCSV,
  convertJSONToExcel,
  convertToUserTimezone,
  convertJSONToExcelUsersSpeakers2023,
  convertJSONToExcelPanelsConference2023
};
