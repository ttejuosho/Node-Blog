module.exports = (sequelize, DataTypes) => {
    const Complaint = sequelize.define("Complaint", {
      complaintId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      reported: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reportedFor: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reportedBy: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reportedPostId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reportedCommentId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reviewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      reviewNotes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    });
  
    Complaint.associate = (models) => {
      Complaint.belongsTo(models.User, {
        onDelete: "cascade",
      });
      Complaint.belongsTo(models.Post, {
        onDelete: "cascade",
      });
    };

    return Complaint;
  };