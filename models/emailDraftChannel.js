"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EmailDraftChannel extends Model {
    static associate(models) {

    }
  }
  EmailDraftChannel.init(
    {
      idChannel: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
          type: DataTypes.TEXT,
          allowNull: false,
      },
      to: {
          type: DataTypes.ARRAY(DataTypes.INTEGER),
          allowNull: false,
      },
      subject: {
          type: DataTypes.TEXT,
          allowNull: false,
      },
      message: {
          type: DataTypes.TEXT,
          allowNull: false,
      }
    },

    {
      sequelize,
      modelName: "EmailDraftChannel",
      tableName: "EmailDraftChannel",
      timestamps: false
    }
  );
  return EmailDraftChannel;
};
