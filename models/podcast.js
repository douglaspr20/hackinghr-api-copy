"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Podcast extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }
  Podcast.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      order: DataTypes.INTEGER,
      imageUrl: DataTypes.STRING,
      dateEpisode: DataTypes.DATEONLY,
      vimeoLink: DataTypes.STRING,
      anchorLink: DataTypes.STRING,
      appleLink: DataTypes.STRING,
      googleLink: DataTypes.STRING,
      breakerLink: DataTypes.STRING,
      pocketLink: DataTypes.STRING,
      radioPublicLink: DataTypes.STRING,
      spotifyLink: DataTypes.STRING,
      iHeartRadioLink: DataTypes.STRING,
      topics: DataTypes.ARRAY(DataTypes.STRING),
      contentType: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Podcast",
    }
  );
  return Podcast;
};
