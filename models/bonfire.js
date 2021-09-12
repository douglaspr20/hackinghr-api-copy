'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bonfire extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Bonfire.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    startTime: DataTypes.STRING,
    endTime: DataTypes.STRING,
    categories: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    link: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Bonfire',
  });
  return Bonfire;
};