const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Insert leave types
    await queryInterface.bulkInsert('LeaveTypes', [
      { name: 'Casual Leave', annualQuota: 12, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sick Leave', annualQuota: 10, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Earned Leave', annualQuota: 15, createdAt: new Date(), updatedAt: new Date() }
    ]);
    
    // Insert users
    await queryInterface.bulkInsert('Users', [
      { username: 'hr_user', email: 'hr@company.com', password: hashedPassword, role: 'hr', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { username: 'manager_user', email: 'manager@company.com', password: hashedPassword, role: 'manager', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { username: 'employee_user', email: 'employee@company.com', password: hashedPassword, role: 'employee', managerId: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ]);
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('LeaveTypes', null, {});
  }
};