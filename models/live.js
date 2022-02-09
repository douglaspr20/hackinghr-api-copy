"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Live extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }
  Live.init(
    {
      live: DataTypes.BOOLEAN,
      title: DataTypes.STRING,
      url: DataTypes.STRING,
      description: DataTypes.STRING,
      isFree: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Live",
    }
  );
  return Live;
};
