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
    },

    {
      sequelize,
      modelName: "SpeakerPanel",
      tableName: "SpeakerPanels"
    }
  );
  return SpeakerPanel;
};
