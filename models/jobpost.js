"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class JobPost extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  JobPost.init(
    {
      title: DataTypes.STRING,
      jobDescription: DataTypes.TEXT,
      city: DataTypes.STRING,
      country: DataTypes.STRING,
      location: DataTypes.ENUM("remote", "on-site", "hybrid"),
      salary: DataTypes.NUMBER,
      level: DataTypes.STRING,
      preferredSkills: DataTypes.STRING,
      linkToApply: DataTypes.STRING,
      closingDate: DataTypes.DATE,
      companyName: DataTypes.STRING,
      companyLogo: DataTypes.STRING,
      companyDescription: DataTypes.JSONB,
    },
    {
      sequelize,
      modelName: "JobPost",
    }
  );
  return JobPost;
};
