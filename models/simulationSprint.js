"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SimulationSprint extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SimulationSprint.hasMany(models.SimulationSprintResource);
      SimulationSprint.hasMany(models.SimulationSprintGroup);
      SimulationSprint.hasMany(models.SimulationSprintParticipant);
    }
  }
  SimulationSprint.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.JSON,
      image: DataTypes.STRING,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "SimulationSprint",
    }
  );
  return SimulationSprint;
};
