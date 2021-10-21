"use strict";

const ConferenceType = require("../enum");

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AnnualConference extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AnnualConference.init(
    {
      title: DataTypes.STRING,
      type: {
        type: DataTypes.STRING,
        values: Object.values(ConferenceType),
        defaultValue: ConferenceType.KEYNOTE,
      },
      categories: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      startTime: DataTypes.STRING,
      endTime: DataTypes.STRING,
      timezone: DataTypes.STRING,
      description: DataTypes.TEXT,
      objectives: DataTypes.TEXT,
      speakers: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
      link: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "AnnualConference",
    }
  );
  return AnnualConference;
};
