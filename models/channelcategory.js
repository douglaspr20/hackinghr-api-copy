'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChannelCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  ChannelCategory.init({
    title: DataTypes.STRING,
    channel: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'ChannelCategory',
  });
  return ChannelCategory;
};