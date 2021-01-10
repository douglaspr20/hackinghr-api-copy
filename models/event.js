'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Event.init({
    title: DataTypes.STRING,
    organizer: DataTypes.STRING,
    date: DataTypes.STRING,
    time: DataTypes.STRING,
    timezone: DataTypes.STRING,
    category: DataTypes.STRING,
    ticket: {
      type: DataTypes.STRING,
      defaultValue: "free",
      values: ["free", "priced"],
    },
    type: DataTypes.ARRAY(DataTypes.STRING),
    location: DataTypes.ARRAY(DataTypes.STRING),
    description: DataTypes.TEXT,
    link: DataTypes.STRING,
    credit: DataTypes.JSON,
    code: DataTypes.STRING,
    image: DataTypes.STRING,
    image2: DataTypes.STRING,
    status: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};