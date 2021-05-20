"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CourseClassUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }
  CourseClassUser.init(
    {
      viewed: DataTypes.BOOLEAN,
      progress_video: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "CourseClassUser",
    }
  );
  return CourseClassUser;
};
