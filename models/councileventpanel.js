"use strict";
const { Model } = require("sequelize");
const { Sequelize } = require(".");
module.exports = (sequelize, DataTypes) => {
  class CouncilEventPanel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CouncilEventPanel.belongsTo(models.CouncilEvent, {
        foreignKey: "CouncilEventId",
        onDelete: "CASCADE",
      });
      CouncilEventPanel.hasMany(models.CouncilEventPanelist);
      CouncilEventPanel.hasMany(models.CouncilEventPanelComment);
    }
  }
  CouncilEventPanel.init(
    {
      panelName: DataTypes.STRING,
      // deprecated
      panelStartAndEndDate: {
        type: DataTypes.ARRAY(DataTypes.DATE),
      },
      numberOfPanelists: {
        type: DataTypes.INTEGER,
      },
      linkToJoin: {
        type: DataTypes.STRING,
      },
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE
    },
    {
      sequelize,
      modelName: "CouncilEventPanel",
    }
  );
  return CouncilEventPanel;
};
