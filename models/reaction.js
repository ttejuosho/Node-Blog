module.exports = (sequelize, DataTypes) => { 
    const Reaction = sequelize.define('Reaction', {
        reactionId: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        reaction: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });
    return Reaction;
};