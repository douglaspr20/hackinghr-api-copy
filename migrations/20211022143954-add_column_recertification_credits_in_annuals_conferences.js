"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        "AnnualConferences", // table name
        "recertification_credits", // new field name
        {
          type: Sequelize.STRING,
          allowNull: true,
        }
      ),
    ]);
  },

  down(queryInterface, Sequelize) {
    // logic for reverting the changes
    return Promise.all([
      queryInterface.removeColumn(
        "AnnualConferences",
        "recertification_credits"
      ),
    ]);
  },
};
