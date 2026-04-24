const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'attendance_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize, DataTypes);
db.Attendance = require('./Attendance')(sequelize, DataTypes);
db.LeaveRequest = require('./LeaveRequest')(sequelize, DataTypes);
db.LeaveType = require('./LeaveType')(sequelize, DataTypes);

// Define associations
db.User.hasMany(db.Attendance, { foreignKey: 'userId' });
db.Attendance.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasMany(db.LeaveRequest, { foreignKey: 'userId' });
db.LeaveRequest.belongsTo(db.User, { foreignKey: 'userId' });

db.User.belongsTo(db.User, { as: 'Manager', foreignKey: 'managerId' });
db.User.hasMany(db.User, { as: 'Subordinates', foreignKey: 'managerId' });

db.LeaveType.hasMany(db.LeaveRequest, { foreignKey: 'leaveTypeId' });
db.LeaveRequest.belongsTo(db.LeaveType, { foreignKey: 'leaveTypeId' });

db.User.hasMany(db.LeaveRequest, { as: 'ActionedBy', foreignKey: 'actionedById' });
db.LeaveRequest.belongsTo(db.User, { as: 'Actioner', foreignKey: 'actionedById' });

module.exports = db;