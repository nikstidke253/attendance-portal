const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// CORS
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

const JWT_SECRET = 'your_super_secret_key_12345';

// =============== MOCK DATABASE (In-Memory) ===============
let users = [
  { id: 1, username: 'hr_user', password: 'password123', email: 'hr@company.com', role: 'hr', isActive: true },
  { id: 2, username: 'manager_user', password: 'password123', email: 'manager@company.com', role: 'manager', isActive: true },
  { id: 3, username: 'emp_user', password: 'password123', email: 'employee@company.com', role: 'employee', isActive: true }
];

let leaveTypes = [
  { id: 1, name: 'Casual Leave', annualQuota: 12 },
  { id: 2, name: 'Sick Leave', annualQuota: 10 },
  { id: 3, name: 'Earned Leave', annualQuota: 15 }
];

let leaves = [
  { id: 1, userId: 3, username: 'emp_user', type: 'Sick Leave', startDate: '2026-04-26', endDate: '2026-04-27', reason: 'Fever', status: 'Pending', appliedOn: new Date().toISOString() }
];

let attendance = [];

// Middleware to extract user from token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============== AUTH ROUTES ==============
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  
  if (!user || user.password !== password || !user.isActive) {
    return res.status(401).json({ error: 'Invalid credentials or inactive account' });
  }
  
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
});

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Backend is working properly!' });
});

// ============== USERS ROUTES ==============
app.get('/api/users', (req, res) => {
  res.json(users.map(({ password, ...u }) => u));
});

app.get('/api/users/managers', (req, res) => {
  res.json(users.filter(u => u.role === 'manager').map(({ password, ...u }) => u));
});

app.post('/api/users', (req, res) => {
  const { username, email, password, role } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    username, email, password, role, isActive: true
  };
  users.push(newUser);
  res.status(201).json({ success: true, user: { id: newUser.id, username } });
});

app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { role, isActive, email } = req.body;
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
  
  if (role !== undefined) users[userIndex].role = role;
  if (isActive !== undefined) users[userIndex].isActive = isActive;
  if (email !== undefined) users[userIndex].email = email;
  
  res.json({ success: true, user: users[userIndex] });
});

// ============== LEAVE TYPES ROUTES ==============
app.get('/api/leave-types', (req, res) => res.json(leaveTypes));

app.post('/api/leave-types', (req, res) => {
  const { name, annualQuota } = req.body;
  const newType = { id: leaveTypes.length ? Math.max(...leaveTypes.map(t => t.id)) + 1 : 1, name, annualQuota: parseInt(annualQuota) };
  leaveTypes.push(newType);
  res.status(201).json(newType);
});

app.put('/api/leave-types/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, annualQuota } = req.body;
  const type = leaveTypes.find(t => t.id === id);
  if (!type) return res.status(404).json({ error: 'Not found' });
  type.name = name || type.name;
  type.annualQuota = annualQuota || type.annualQuota;
  res.json(type);
});

app.delete('/api/leave-types/:id', (req, res) => {
  leaveTypes = leaveTypes.filter(t => t.id !== parseInt(req.params.id));
  res.json({ success: true });
});

// ============== LEAVES ROUTES ==============
app.get('/api/leaves/my', authenticateToken, (req, res) => {
  res.json(leaves.filter(l => l.userId === req.user.id));
});

app.get('/api/leaves', authenticateToken, (req, res) => {
  if (req.user.role === 'employee') return res.status(403).json({ error: 'Unauthorized' });
  res.json(leaves);
});

app.post('/api/leaves/apply', authenticateToken, (req, res) => {
  const { leaveTypeId, startDate, endDate, reason } = req.body;
  const type = leaveTypes.find(t => t.id === parseInt(leaveTypeId));
  const newLeave = {
    id: leaves.length ? Math.max(...leaves.map(l => l.id)) + 1 : 1,
    userId: req.user.id,
    username: req.user.username,
    type: type ? type.name : 'Unknown',
    startDate,
    endDate,
    reason,
    status: 'Pending',
    appliedOn: new Date().toISOString()
  };
  leaves.push(newLeave);
  res.status(201).json({ success: true, leave: newLeave });
});

app.put('/api/leaves/:id/status', authenticateToken, (req, res) => {
  if (req.user.role === 'employee') return res.status(403).json({ error: 'Unauthorized' });
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const leave = leaves.find(l => l.id === id);
  if (!leave) return res.status(404).json({ error: 'Not found' });
  leave.status = status;
  res.json({ success: true, leave });
});

// ============== ATTENDANCE ROUTES ==============
app.get('/api/attendance/my', authenticateToken, (req, res) => {
  res.json(attendance.filter(a => a.userId === req.user.id));
});

app.get('/api/attendance', authenticateToken, (req, res) => {
  if (req.user.role === 'employee') return res.status(403).json({ error: 'Unauthorized' });
  res.json(attendance);
});

app.get('/api/attendance/today', authenticateToken, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const record = attendance.find(a => a.userId === req.user.id && a.date === today);
  res.json({
    hasCheckedIn: !!record,
    hasCheckedOut: !!(record && record.checkOut)
  });
});

app.post('/api/attendance/checkin', authenticateToken, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const time = new Date().toLocaleTimeString();
  if (attendance.find(a => a.userId === req.user.id && a.date === today)) {
    return res.status(400).json({ error: 'Already checked in today' });
  }
  attendance.push({
    id: attendance.length ? Math.max(...attendance.map(a => a.id)) + 1 : 1,
    userId: req.user.id,
    username: req.user.username,
    date: today,
    checkIn: time,
    checkOut: null
  });
  res.json({ success: true });
});

app.post('/api/attendance/checkout', authenticateToken, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const time = new Date().toLocaleTimeString();
  const record = attendance.find(a => a.userId === req.user.id && a.date === today);
  if (!record) return res.status(400).json({ error: 'No check-in found for today' });
  if (record.checkOut) return res.status(400).json({ error: 'Already checked out' });
  record.checkOut = time;
  res.json({ success: true });
});

// ============== DASHBOARD STATS ==============
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  if (req.user.role === 'hr') {
    res.json({
      totalUsers: users.length,
      pendingLeaves: leaves.filter(l => l.status === 'Pending').length,
      approvedLeaves: leaves.filter(l => l.status === 'Approved').length,
      totalLeaveTypes: leaveTypes.length
    });
  } else if (req.user.role === 'manager') {
    res.json({
      teamMembers: users.filter(u => u.role === 'employee').length,
      pendingLeaves: leaves.filter(l => l.status === 'Pending').length,
      todayAttendance: attendance.filter(a => a.date === new Date().toISOString().split('T')[0]).length
    });
  } else {
    const todayRecord = attendance.find(a => a.userId === req.user.id && a.date === new Date().toISOString().split('T')[0]);
    res.json({
      totalLeaves: leaves.filter(l => l.userId === req.user.id).length,
      pendingLeaves: leaves.filter(l => l.userId === req.user.id && l.status === 'Pending').length,
      todayStatus: todayRecord ? (todayRecord.checkOut ? 'Checked Out' : 'Checked In') : 'Not Checked In'
    });
  }
});

// ============== START SERVER ==============
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
========================================
🚀 SERVER STARTED SUCCESSFULLY!
========================================
📍 Port: ${PORT}
========================================
  `);
});