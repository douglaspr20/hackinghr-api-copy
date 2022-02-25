"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    Promise.all([queryInterface.removeColumn("Events", "usersAssistence")]);
    return Promise.all([
      queryInterface.addColumn("Events", "usersAssistence", {
        type: Sequelize.ARRAY(Sequelize.JSONB),
        defaultValue: [],
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
    return Promise.all([
      queryInterface.removeColumn("Events", "usersAssistence"),
    ]);
  },
};
