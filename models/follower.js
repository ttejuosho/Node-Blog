module.exports = (sequelize, DataTypes) => {
  const Follower = sequelize.define("Follower", {
    followerId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    followedUserUsernam: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });
  return Follower;
};
