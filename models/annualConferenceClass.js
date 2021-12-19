"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AnnualConferenceClass extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }
  AnnualConferenceClass.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      AnnualConferenceId: DataTypes.INTEGER,
      videoUrl: DataTypes.STRING,
      duration: DataTypes.STRING,
      topics: DataTypes.ARRAY(DataTypes.STRING),
    },
    {
      sequelize,
      modelName: "AnnualConferenceClass",
    }
  );
  return AnnualConferenceClass;
};
