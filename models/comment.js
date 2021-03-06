module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define("Comment", {
    commentId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    commentBody: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    dislikesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.User, {
      onDelete: "cascade",
    });
    Comment.belongsTo(models.Post, {
      onDelete: "cascade",
    });
    Comment.hasMany(models.Reaction, {
      onDelete: "cascade",
    });
  };

  return Comment;
};
