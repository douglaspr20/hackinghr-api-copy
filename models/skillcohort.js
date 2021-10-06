'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SkillCohort extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  SkillCohort.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    objectives: DataTypes.STRING,
    image: DataTypes.STRING,
    currentWeekNumber: DataTypes.INTEGER,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'SkillCohort',
  });
  return SkillCohort;
};