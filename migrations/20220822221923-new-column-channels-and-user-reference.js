'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Users", "channelReference", {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      }),
      queryInterface.addColumn("Channels", "image2", {
        type: Sequelize.TEXT,
        defaultValue: "",
      })
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "channelReference"),
      queryInterface.removeColumn("Channels", "image2")
    ])
  },
};
