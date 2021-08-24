"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PostComment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PostComment.hasMany(models.PostComment);
    }
  }
  PostComment.init(
    {
      comment: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "PostComment",
    }
  );
  return PostComment;
};
