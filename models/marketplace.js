"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Marketplace extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Marketplace.belongsTo(models.MarketplaceCategories, { foreignKey: 'MarketplaceCategoryId' });
    }
  }
  Marketplace.init(
    {
      name: DataTypes.STRING,
      logoUrl: DataTypes.STRING,
      description: DataTypes.STRING,
      url: DataTypes.STRING,
      contact_name: DataTypes.STRING,
      contact_email: DataTypes.STRING,
      contact_phone: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Marketplace",
    }
  );
  return Marketplace;
};
