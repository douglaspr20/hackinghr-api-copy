'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PodcastSeries extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  PodcastSeries.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    objectives: DataTypes.TEXT,
    duration: DataTypes.STRING,
    podcasts: DataTypes.ARRAY(DataTypes.INTEGER),
  }, {
    sequelize,
    modelName: 'PodcastSeries',
  });
  return PodcastSeries;
};