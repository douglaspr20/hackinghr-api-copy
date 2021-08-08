"use strict";
const { Model } = require("sequelize");
const bcryptService = require("../services/bcrypt.service");

module.exports = (sequelize, DataTypes) => {
  class PodcastSeries extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PodcastSeries.init(
    {
      title: DataTypes.STRING,
      img: DataTypes.STRING,
      description: DataTypes.TEXT,
      objectives: DataTypes.TEXT,
      duration: DataTypes.STRING,
      podcasts: DataTypes.ARRAY(DataTypes.INTEGER),
      code: DataTypes.STRING,
      hrCreditOffered: DataTypes.TEXT,
      shrmCode: {
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue("shrmCode");

          return bcryptService().password(rawValue);
        },
      },
      hrciCode: {
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue("hrciCode");

          return bcryptService().password(rawValue);
        },
      },
      categories: DataTypes.ARRAY(DataTypes.STRING),
    },
    {
      sequelize,
      modelName: "PodcastSeries",
    }
  );
  return PodcastSeries;
};
