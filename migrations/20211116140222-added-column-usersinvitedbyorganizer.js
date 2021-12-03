"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("Bonfires", "usersInvitedByOrganizer", {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Bonfires", "usersInvitedByOrganizer", {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
    });
  },
};
