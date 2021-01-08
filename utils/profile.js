const isEmpty = require("lodash").isEmpty;

const getProfileCompletion = (user) => {
  const fields = [
    "firstName",
    "lastName",
    "company",
    "img",
    "about",
    "titleProfessions",
    "topicsOfInterest",
    "personalLinks",
    "language",
    "timezone",
  ];
  const length = fields.length;
  let countOfCompleted = fields.reduce((res, item) => {
    if (item === "personalLinks") {
      return isEmptyPersonalLinks(user.personalLinks) ? res : res + 1;
    }
    return isEmpty(user[item]) ? res : res + 1;
  }, 0);

  return Math.floor((countOfCompleted / length) * 100);
};

const isEmptyPersonalLinks = (personalLinks) => {
  let empty = true;
  if (personalLinks) {
    Object.keys(personalLinks).forEach((contact) => {
      if (personalLinks[contact]) {
        empty = false;
      }
    });
  }

  return empty;
};

module.exports = { getProfileCompletion };
