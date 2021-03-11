'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Channel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Channel.init({
    owner: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    image: DataTypes.STRING,
    resources: DataTypes.ARRAY(DataTypes.INTEGER),
    videos: DataTypes.ARRAY(DataTypes.INTEGER),
    podcasts: DataTypes.ARRAY(DataTypes.INTEGER),
    events: DataTypes.ARRAY(DataTypes.INTEGER),
    followedUsers: DataTypes.ARRAY(DataTypes.INTEGER),
  }, {
    sequelize,
    modelName: 'Channel',
  });
  return Channel;
};