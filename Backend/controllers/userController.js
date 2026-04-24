const db = require('../models');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const users = await db.User.findAll({
      attributes: { exclude: ['password'] },
      include: [{
        model: db.User,
        as: 'Manager',
        attributes: ['id', 'username']
      }]
    });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createUser = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { username, email, password, role, managerId } = req.body;
    
    const existingUser = await db.User.findOne({
      where: { [db.Sequelize.Op.or]: [{ username }, { email }] }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await db.User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'employee',
      managerId: managerId || null,
      isActive: true
    });
    
    const { password: _, ...userWithoutPassword } = user.toJSON();
    
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { id } = req.params;
    const { role, managerId, isActive } = req.body;
    
    const user = await db.User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.role === 'hr' && isActive === false) {
      const hrCount = await db.User.count({ where: { role: 'hr', isActive: true } });
      if (hrCount <= 1) {
        return res.status(400).json({ error: 'Cannot deactivate the only HR user' });
      }
    }
    
    await user.update({ role, managerId, isActive });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getManagers = async (req, res) => {
  try {
    const managers = await db.User.findAll({
      where: {
        role: 'manager',
        isActive: true
      },
      attributes: ['id', 'username', 'email']
    });
    
    res.json(managers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAllUsers, createUser, updateUser, getManagers };