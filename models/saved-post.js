module.exports = (sequelize, DataTypes) => {
    const SavedPost = sequelize.define("SavedPost", {
        savedPostId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
    });
  
    SavedPost.associate = (models) => {
        SavedPost.belongsTo(models.User, {
          onDelete: "cascade",
        });
        SavedPost.belongsTo(models.Post, {
          onDelete: "cascade",
        });
    }
  
    return SavedPost;
  };
  