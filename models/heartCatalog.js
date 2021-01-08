"use strict";
const db = require("../models");

const { Model } = require("sequelize");
const Heart = db.Heart;

module.exports = (sequelize, DataTypes) => {
  class HeartCatalog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      HeartCatalog.hasMany(models.Heart, {foreignKey: 'heartCatalogId'});
    }
  }
  HeartCatalog.init(
    {
      name: DataTypes.STRING,
      iconName: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "HeartCatalog",
    }
  );
  return HeartCatalog;
};
