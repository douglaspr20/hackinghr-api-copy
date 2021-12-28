"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("JobPosts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      title: {
        type: Sequelize.STRING,
      },
      jobDescription: {
        type: Sequelize.TEXT,
      },
      city: {
        type: Sequelize.STRING,
      },
      country: {
        type: Sequelize.STRING,
      },
      location: {
        type: Sequelize.ENUM("remote", "on-site", "hybrid"),
      },
      salary: {
        type: Sequelize.INTEGER,
      },
      level: {
        type: Sequelize.STRING,
      },
      preferredSkills: {
        type: Sequelize.STRING,
      },
      linkToApply: {
        type: Sequelize.STRING,
      },
      closingDate: {
        type: Sequelize.DATE,
      },
      companyName: {
        type: Sequelize.STRING,
      },
      companyLogo: {
        type: Sequelize.STRING,
      },
      companyDescription: {
        type: Sequelize.JSONB,
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
    await queryInterface.dropTable("JobPosts");
  },
};
