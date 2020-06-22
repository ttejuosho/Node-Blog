module.exports = (sequelize, DataTypes) => {
  const Subscriber = sequelize.define("Subscriber", {
    subscriberId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    subscriberName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subscriberEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      isEmail: true,
    },
  });
  return Subscriber;
};
