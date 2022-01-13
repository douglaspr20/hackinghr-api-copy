"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("BusinessPartnerDocuments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      title: Sequelize.STRING,
      description: Sequelize.STRING,
      categories: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      },
      documentFileName: Sequelize.STRING,
      documentFileUrl: Sequelize.STRING,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("BusinessPartnerDocuments");
  },
};
