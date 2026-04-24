module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Leave', {
    userId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    reason: DataTypes.STRING,
    status: { type: DataTypes.STRING, defaultValue: 'Pending' },
    remark: DataTypes.STRING
  });
};