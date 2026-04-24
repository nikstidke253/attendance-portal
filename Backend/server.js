const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your_super_secret_key_123';

// Hardcoded Users - योग्य क्रेडेन्शियल्स इथे आहेत
const users = [
  { id: 1, username: 'hr_user', password: 'password123', email: 'hr@company.com', role: 'hr', isActive: true },
  { id: 2, username: 'manager_user', password: 'password123', email: 'manager@company.com', role: 'manager', isActive: true },
  { id: 3, username: 'emp_user', password: 'password123', email: 'employee@company.com', role: 'employee', isActive: true }
];

// ============== TEST ROUTE ==============
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!', users: users.map(u => ({ username: u.username, role: u.role })) });
});

// ============== LOGIN ROUTE ==============
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  console.log('📝 Login Attempt:', username, password);
  
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
    { expiresIn: '24h' }
  );
  
  console.log('✅ Login Successful:', username);
  res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

// ============== VERIFY TOKEN ROUTE ==============
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, username: user.username, email: user.email, role: user.role, isActive: user.isActive });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ============== OTHER ROUTES ==============
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
  res.json({ totalUsers: users.length, pendingLeaves: 2, approvedLeaves: 5, totalLeaveTypes: 3 });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Test Credentials:`);
  console.log(`   👑 HR: hr_user / password123`);
  console.log(`   📊 Manager: manager_user / password123`);
  console.log(`   👤 Employee: emp_user / password123`);
  console.log(`========================================\n`);
});