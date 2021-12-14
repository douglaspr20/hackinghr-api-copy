"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        "Events", // table name
        "externalLink", // new field name
        {
          type: Sequelize.STRING,
          allowNull: true,
        }
      ),
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropColumn("Events", "externalLink");
  },
};
