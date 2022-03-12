"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("AnnualConferences", "saveForLater", {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
      }),
      queryInterface.addColumn("AnnualConferences", "viewed", {
        type: Sequelize.JSONB,
        defaultValue: {},
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("AnnualConferences", "saveForLater"),
      queryInterface.removeColumn("AnnualConferences", "viewed"),
    ]);
  },
};
