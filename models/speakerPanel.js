"use strict";

const ConferenceType = require("../enum");

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SpeakerPanel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    //   SpeakerPanel.hasMany(models.Instructor, {
    //     foreignKey: "id",
    //     foreignKeyConstraint: null,
    //   });
        SpeakerPanel.belongsTo(models.User, {foreignKey: 'OwnerId'})
        SpeakerPanel.hasMany(models.SpeakerMemberPanel,{foreignKey: 'SpeakersPanelId'});
    }
  }
  SpeakerPanel.init(
    {
    //   OwnerId: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false
    //   },
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
