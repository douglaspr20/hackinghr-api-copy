"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Course.hasMany(models.CourseClass);
      Course.hasMany(models.CourseSponsor);
      Course.hasMany(models.CourseInstructor);
    }
  }
  Course.init(
    {
      image: DataTypes.STRING,
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      topics: DataTypes.ARRAY(DataTypes.STRING),
      shrmCode: DataTypes.STRING,
      hrciCode: DataTypes.STRING,
      showClaim: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Course",
    }
  );
  return Course;
};
