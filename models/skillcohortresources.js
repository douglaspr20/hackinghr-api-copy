'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SkillCohortResources extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  SkillCohortResources.init({
    resourceLink: DataTypes.STRING,
    releaseDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'SkillCohortResources',
  });
  return SkillCohortResources;
};