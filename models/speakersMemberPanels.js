"use strict";

const ConferenceType = require("../enum");

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SpeakerMemberPanel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    //   SpeakerMemberPanel.hasMany(models.Instructor, {
    //     foreignKey: "id",
    //     foreignKeyConstraint: null,
    //   });
        SpeakerMemberPanel.belongsTo(models.User, {foreignKey: 'UserId'})
        SpeakerMemberPanel.belongsTo(models.SpeakerPanel, {foreignKey: 'SpeakersPanelId'})
    }
  }
  SpeakerMemberPanel.init(
    {
    //   OwnerId: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false
    //   },
      isModerator: {
        type: DataTypes.BOOLEAN,
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
      modelName: "SpeakerMemberPanel",
      tableName: "SpeakerMemberPanels"
    }
  );
  return SpeakerMemberPanel;
};
