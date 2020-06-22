module.exports = (sequelize, DataTypes) => { 
    const Tag = sequelize.define('Tag', {
        tagId: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        tag: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });
    return Tag;
};