"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class JourneyItems extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      JourneyItems.hasMany(models.Journey);
    }
  }
  JourneyItems.init(
    {
      contentType: DataTypes.STRING,
      contentId: DataTypes.INTEGER,
      viewed: DataTypes.BOOLEAN,
      removed: DataTypes.BOOLEAN,
      isNew: DataTypes.BOOLEAN,
      order: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "JourneyItems",
    }
  );
  return JourneyItems;
};
