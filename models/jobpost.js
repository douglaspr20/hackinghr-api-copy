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
      JobPost.belongsTo(models.User);
    }
  }
  JobPost.init(
    {
      title: DataTypes.STRING,
      jobDescription: DataTypes.JSONB,
      city: DataTypes.STRING,
      country: DataTypes.STRING,
      location: DataTypes.ARRAY(DataTypes.STRING),
      salary: DataTypes.STRING,
      level: DataTypes.STRING,
      preferredSkills: DataTypes.ARRAY(DataTypes.STRING),
      linkToApply: DataTypes.STRING,
      closingDate: DataTypes.DATE,
      timezone: DataTypes.STRING,
      companyName: DataTypes.STRING,
      companyLogo: DataTypes.STRING,
      companyDescription: DataTypes.TEXT,
      // status: DataTypes.ENUM("active", "draft", "expired", "closed"),
      status: DataTypes.STRING,
      keywords: DataTypes.ARRAY(DataTypes.STRING),
    },
    {
      sequelize,
      modelName: "JobPost",
    }
  );
  return JobPost;
};
