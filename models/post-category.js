module.exports = (sequelize, DataTypes) => {
  const PostCategory = sequelize.define("PostCategory", {
    postCategoryId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    postCategory: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  return PostCategory;
};
