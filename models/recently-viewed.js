module.exports = (sequelize, DataTypes) => {
  const RecentlyViewed = sequelize.define("RecentlyViewed", {
    recentlyViewedId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
  });

  RecentlyViewed.associate = (models) => {
    RecentlyViewed.belongsTo(models.User, {
        onDelete: "cascade",
      });
      RecentlyViewed.belongsTo(models.Post, {
        onDelete: "cascade",
      });
  }

  return RecentlyViewed;
};
