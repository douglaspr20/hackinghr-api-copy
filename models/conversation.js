"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
