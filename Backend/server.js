const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// CORS - सर्वांना परवानगी
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

const JWT_SECRET = 'your_super_secret_key_12345';

// युजर्सची यादी (कोणतीही database नाही)
const users = [
  { id: 1, username: 'hr_user', password: 'password123', email: 'hr@company.com', role: 'hr' },
  { id: 2, username: 'manager_user', password: 'password123', email: 'manager@company.com', role: 'manager' },
  { id: 3, username: 'emp_user', password: 'password123', email: 'employee@company.com', role: 'employee' }
];

// ============== TEST ROUTES ==============
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is working properly!',
    timestamp: new Date().toISOString(),
    users: users.map(u => ({ username: u.username, role: u.role }))
  });
});

// ============== LOGIN ROUTE ==============
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  console.log('📝 Login attempt:', username);
  
  const user = users.find(u => u.username === username);
  
  if (!user) {
    console.log('❌ User not found:', username);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  if (user.password !== password) {
    console.log('❌ Password mismatch for:', username);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  console.log('✅ Login successful:', username);
  
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

// ============== VERIFY TOKEN ==============
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ============== OTHER NECESSARY ROUTES ==============
app.get('/api/users', (req, res) => {
  res.json(users.map(({ password, ...u }) => u));
});

app.get('/api/leave-types', (req, res) => {
  res.json([
    { id: 1, name: 'Casual Leave', annualQuota: 12 },
    { id: 2, name: 'Sick Leave', annualQuota: 10 },
    { id: 3, name: 'Earned Leave', annualQuota: 15 }
  ]);
});

app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalUsers: users.length,
    pendingLeaves: 0,
    approvedLeaves: 0,
    totalLeaveTypes: 3
  });
});

app.get('/api/leaves/my', (req, res) => {
  res.json([]);
});

app.get('/api/attendance/my', (req, res) => {
  res.json([]);
});

app.get('/api/attendance/today', (req, res) => {
  res.json({ hasCheckedIn: false, hasCheckedOut: false });
});

// ============== START SERVER ==============
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
========================================
🚀 SERVER STARTED SUCCESSFULLY!
========================================
📍 Port: ${PORT}
📍 Test API: /api/test
📍 Login API: /api/auth/login

📝 TEST CREDENTIALS:
   HR:       hr_user / password123
   Manager:  manager_user / password123
   Employee: emp_user / password123
========================================
  `);
});