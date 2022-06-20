"use strict";

const ConferenceType = require("../enum");

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SpeakerPanel extends Model {

    static associate(models) {
        SpeakerPanel.belongsTo(models.User, {foreignKey: 'OwnerId'})
        SpeakerPanel.hasMany(models.SpeakerMemberPanel,{foreignKey: 'SpeakersPanelId'});
    }
  }
  SpeakerPanel.init(
    {
      panelName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      timeZone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      metaData: {
        type: DataTypes.STRING,
      },
      recertificactionCredits: {
        type: DataTypes.STRING,
      },
      link: {
        type: DataTypes.STRING,
      },
      objetives: {
        type: DataTypes.STRING,
      },
      category: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      type: {
        type: DataTypes.STRING,
      },
      usersAddedToThisAgenda: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      }
    },

    {
      sequelize,
      modelName: "SpeakerPanel",
      tableName: "SpeakerPanels"
    }
  );
  return SpeakerPanel;
};
