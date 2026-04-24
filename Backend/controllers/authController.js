const jwt = require('jsonwebtoken');
const db = require('../models');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await db.User.findOne({ where: { username } });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }
    
    const isValidPassword = await user.validatePassword(password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      include: [{
        model: db.User,
        as: 'Manager',
        attributes: ['id', 'username', 'email']
      }]
    });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { login, getCurrentUser };