module.exports = (sequelize, DataTypes) => {
  const LeaveType = sequelize.define('LeaveType', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    annualQuota: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 12
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'LeaveTypes'
  });

  return LeaveType;
};