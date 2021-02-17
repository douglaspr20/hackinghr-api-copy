'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("JourneyItems", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      contentType: Sequelize.STRING,
      topic: Sequelize.STRING,
      contentId: Sequelize.INTEGER,
      viewed: Sequelize.BOOLEAN,
      removed: Sequelize.BOOLEAN,
      isNew: Sequelize.BOOLEAN,
      order: Sequelize.INTEGER,
      itemCreatedAt: Sequelize.DATE,
      JourneyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Journeys',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("JourneyItems");
  }
};
