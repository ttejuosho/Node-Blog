module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define("Post", {
    postId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    postTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postDescription: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postCategory: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postBody: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isDraft: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    dislikesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    postImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  Post.associate = (models) => {
    Post.belongsTo(models.User, {
      onDelete: "cascade",
    });
    Post.hasMany(models.Comment, {
      onDelete: "cascade",
    });
    Post.hasMany(models.Reaction, {
      onDelete: "cascade",
    });
    Post.hasMany(models.Subscriber, {
      onDelete: "cascade",
    });
  };

  return Post;
};
