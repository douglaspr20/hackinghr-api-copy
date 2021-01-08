"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Heart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Heart.init(
    {
      heartCatalogId: DataTypes.STRING,
      parentId: DataTypes.INTEGER,
      text: DataTypes.STRING,
      score: DataTypes.DECIMAL,
    },
    {
      sequelize,
      modelName: "Heart",
    }
  );
  return Heart;
};
