const jwt = require('jsonwebtoken');
const db = require('../models');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('Login attempt:', username);

    // Find user by username
    const user = await db.User.findOne({ where: { username } });

    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      console.log('User inactive:', username);
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Plain text password comparison (for development)
    if (user.password !== password) {
      console.log('Password mismatch for:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful:', username);

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret123',
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
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'role', 'isActive']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { login, getCurrentUser };