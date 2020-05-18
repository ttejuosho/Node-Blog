module.exports = (sequelize, DataTypes) => { 
    const Subscriber = sequelize.define('Subscriber', {
        subscriberId: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
          },
        subscriberEmail: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    });
    return Subscriber;
};