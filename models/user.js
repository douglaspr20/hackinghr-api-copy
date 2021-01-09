"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      username: DataTypes.STRING,
      role: {
        type: DataTypes.ENUM,
        values: ["admin", "user"],
      },
      company: DataTypes.STRING,
      about: DataTypes.STRING,
      titleProfessions: DataTypes.STRING,
      proficiencyLevel: DataTypes.STRING,
      topicsOfInterest: DataTypes.ARRAY(DataTypes.STRING),
      personalLinks: DataTypes.JSON,
      language: DataTypes.STRING,
      timezone: DataTypes.STRING,
      completed: DataTypes.BOOLEAN,
      percentOfCompletion: DataTypes.INTEGER,
      abbrName: DataTypes.STRING,
      img: DataTypes.STRING,
      memberShip: {
        type: DataTypes.STRING,
        defaultValue: "free",
        values: ["free", "premium"],
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
