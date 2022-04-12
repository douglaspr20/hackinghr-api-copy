"use strict";
const { Model } = require("sequelize");
const { Settings } = require("../enum");
const cryptoService = require("../services/crypto.service");

const VisibleLevel = Settings.VISIBLE_LEVEL;

module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Event.hasMany(models.Library);
    }
  }
  Event.init(
    {
      title: DataTypes.STRING,
      organizer: DataTypes.STRING,
      startDate: DataTypes.STRING,
      endDate: DataTypes.STRING,
      timezone: DataTypes.STRING,
      categories: DataTypes.ARRAY(DataTypes.STRING),
      ticket: {
        type: DataTypes.STRING,
        defaultValue: "free",
        values: ["free", "premium"],
      },
      type: DataTypes.ARRAY(DataTypes.STRING),
      location: DataTypes.ARRAY(DataTypes.STRING),
      description: DataTypes.JSON,
      link: DataTypes.STRING,
      externalLink: DataTypes.STRING,
      registrationLink: DataTypes.STRING,
      credit: {
        type: DataTypes.JSON,
        get() {
          const rawValue = this.getDataValue("credit");

          const shrmCode =
            rawValue && rawValue.SHRM ? rawValue.SHRM.money || "" : "";
          const hrciCode =
            rawValue && rawValue.HRCI ? rawValue.HRCI.money || "" : "";

          return {
            SHRM: {
              money: cryptoService().encrypt(shrmCode),
            },
            HRCI: {
              money: cryptoService().encrypt(hrciCode),
            },
          };
        },
      },
      code: DataTypes.STRING,
      image: DataTypes.STRING,
      image2: DataTypes.STRING,
      status: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      users: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
      usersAssistence: {
        type: DataTypes.ARRAY(DataTypes.JSONB),
        defaultValue: [],
      },
      isOverEmailSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      publicLink: DataTypes.STRING,
      organizerEmail: DataTypes.STRING,
      level: {
        type: DataTypes.INTEGER,
        values: [VisibleLevel.DEFAULT, VisibleLevel.CHANNEL, VisibleLevel.ALL],
        defaultValue: VisibleLevel.DEFAULT,
      },
      channel: DataTypes.INTEGER,
      showClaim: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      startAndEndTimes: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: [],
      },
      isAnnualConference: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      venueAddress: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      ticketFee: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Event",
    }
  );
  return Event;
};
