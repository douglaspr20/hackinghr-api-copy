"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CouncilEvent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CouncilEvent.init(
    {
      eventName: DataTypes.STRING,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      description: DataTypes.TEXT,
      numberOfPanels: DataTypes.INTEGER,
      panels: {
        type: DataTypes.ARRAY(DataTypes.JSONB),
        defaultValue: [],
      },
      status: DataTypes.ENUM("draft", "active"),
    },
    {
      sequelize,
      modelName: "CouncilEvent",
    }
  );
  return CouncilEvent;
};
