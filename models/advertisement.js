"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Advertisement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Advertisement.belongsTo(models.User, { foreignKey: "UserId" });
    }
  }
  Advertisement.init(
    {
      advertisementLink: DataTypes.STRING,
      // adBannerSize: DataTypes.STRING,
      adCostPerDay: DataTypes.STRING,
      adDurationByDays: DataTypes.INTEGER,
      page: DataTypes.STRING,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      datesBetweenStartDateAndEndDate: DataTypes.ARRAY(DataTypes.DATE),
      adContentLink: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Advertisement",
    }
  );
  return Advertisement;
};
