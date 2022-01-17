"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate(models) {
      Conversation.hasMany(models.Message);
    }
  }
  Conversation.init(
    {
      members: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    {
      sequelize,
    }
  );
  return Conversation;
};
