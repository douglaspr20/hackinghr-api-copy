"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ConferenceLibrary extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ConferenceLibrary.init(
    {
      title: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
      categories: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      link: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
      year: {
        type: DataTypes.INTEGER,
        defaultValue: 2019,
      },
      order: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      meta: {
        type: DataTypes.TEXT,
        defaultValue: "",
      },
      shrmCode: DataTypes.STRING,
      hrciCode: DataTypes.STRING,
      showClaim: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "ConferenceLibrary",
    }
  );
  return ConferenceLibrary;
};
