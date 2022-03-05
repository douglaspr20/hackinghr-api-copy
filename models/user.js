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
      User.hasMany(models.HeartUserRate);
      User.hasMany(models.Heart);
      User.hasMany(models.Journey);
      User.hasOne(models.Channel, {
        foreignKey: {
          name: "owner",
          allowNull: true,
        },
      });
      User.hasMany(models.CourseClassUser);
      User.hasMany(models.AnnualConferenceClassUser);
      User.hasMany(models.Post);
      User.hasMany(models.PostLike);
      User.hasMany(models.PostComment);
      User.hasMany(models.PostFollow);
      User.hasMany(models.Notification);
      User.hasMany(models.SkillCohortParticipant);
      User.hasMany(models.SkillCohortGroupingMember);
      User.hasMany(models.JobPost);
      User.hasMany(models.Advertisement);
      User.hasOne(models.MarketPlaceProfile);
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
      location: DataTypes.STRING,
      city: DataTypes.STRING,
      about: DataTypes.TEXT,
      titleProfessions: DataTypes.STRING,
      proficiencyLevel: DataTypes.STRING,
      topicsOfInterest: DataTypes.ARRAY(DataTypes.STRING),
      personalLinks: DataTypes.JSON,
      languages: DataTypes.ARRAY(DataTypes.STRING),
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
      events: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
      mentor: DataTypes.INTEGER,
      mentee: DataTypes.INTEGER,
      subscription_startdate: DataTypes.DATE,
      subscription_enddate: DataTypes.DATE,
      external_payment: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      attended: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      isOpenReceivingEmail: {
        type: DataTypes.INTEGER,
        defaultValue: -1,
      },
      followChannels: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
      channel: {
        type: DataTypes.INTEGER,
      },
      channelsSubscription: DataTypes.BOOLEAN,
      channelsSubscription_startdate: DataTypes.DATE,
      channelsSubscription_enddate: DataTypes.DATE,
      attendedToConference: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      sessions: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
      resumeFileName: DataTypes.STRING,
      resumeUrl: DataTypes.STRING,
      recentJobLevel: DataTypes.STRING,
      recentWorkArea: DataTypes.ARRAY(DataTypes.STRING),
      sizeOfOrganization: DataTypes.STRING,
      councilMember: DataTypes.BOOLEAN,
      isBusinessPartner: DataTypes.STRING,
      bonfires: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
      pointsConferenceLeaderboard: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      addedFirstSession: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      sessionsJoined: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
      isSponsor: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      recruiterSubscription: DataTypes.BOOLEAN,
      recruiterSubscription_startdate: DataTypes.DATE,
      recruiterSubscription_enddate: DataTypes.DATE,
      acceptTermsConditionGConference: DataTypes.BOOLEAN,
      viewRulesGConference: DataTypes.BOOLEAN,
      dateSendEmailTermsConditionGConference: DataTypes.DATE,
      matchedCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      isAdvertiser: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      advertiserSubscriptionDate: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
