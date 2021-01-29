"use strict";
const { Model } = require("sequelize");
const { ReviewStatus } = require("../enum");

module.exports = (sequelize, DataTypes) => {
  class Library extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Library.init(
    {
      title: DataTypes.STRING,
      link: DataTypes.STRING,
      description: DataTypes.STRING,
      topics: DataTypes.ARRAY(DataTypes.STRING),
      contentType: DataTypes.STRING,
      image: DataTypes.STRING,
      language: DataTypes.STRING,
      recommended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      approvalStatus: {
        type: DataTypes.STRING,
        values: [
          ReviewStatus.APPROVED,
          ReviewStatus.REJECTED,
          ReviewStatus.PENDING,
        ],
        defaultValue: ReviewStatus.PENDING,
      },
    },
    {
      sequelize,
      modelName: "Library",
    }
  );
  return Library;
};
