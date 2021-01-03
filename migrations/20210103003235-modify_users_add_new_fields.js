"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        "Users", // table name
        "company", // new field name
        {
          type: Sequelize.STRING,
          allowNull: true,
        }
      ),
      queryInterface.addColumn("Users", "about", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn("Users", "titleProfessions", {
        type: Sequelize.TEXT,
        allowNull: true,
      }),
      queryInterface.addColumn("Users", "proficiencyLevel", {
        type: Sequelize.TEXT,
        allowNull: true,
      }),
      queryInterface.addColumn("Users", "topicsOfInterest", {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      }),
      queryInterface.addColumn("Users", "personalLinks", {
        type: Sequelize.JSON,
      }),
      queryInterface.addColumn("Users", "language", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn("Users", "timezone", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn("Users", "completed", {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      }),
      queryInterface.addColumn("Users", "percentOfCompletion", {
        type: Sequelize.INTEGER,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
