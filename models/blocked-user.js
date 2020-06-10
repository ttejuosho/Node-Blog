module.exports = (sequelize, DataTypes) => {
    const BlockedUser = sequelize.define("BlockedUser", {
        blockedUserId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        },
        blockedUser: {
            type: DataTypes.STRING,
            allowNull: false
        },
        blockedByUser: {
            type: DataTypes.STRING,
            allowNull: false
        },
    });
  
    return BlockedUser;
  };
  