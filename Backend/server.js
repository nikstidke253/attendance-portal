const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Track user last activity for session timeout
const userLastActivity = new Map();

// Session timeout middleware (15 minutes)
const sessionTimeout = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const lastActivity = userLastActivity.get(decoded.id);
      const now = Date.now();
      
      if (lastActivity && (now - lastActivity) > 15 * 60 * 1000) {
        userLastActivity.delete(decoded.id);
        return res.status(401).json({ error: 'Session expired due to 15 minutes of inactivity' });
      }
      
      userLastActivity.set(decoded.id, now);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid session' });
    }
  }
  
  next();
};

// Mock Database
let users = [
  { 
    id: 1, 
    username: 'hr_user', 
    email: 'hr@company.com', 
    password: '$2a$10$rqG5t6kqLlLqLlLqLlLqLuO5KqfL5KqfL5KqfL5Kq',
    role: 'hr', 
    isActive: true,
    managerId: null,
    createdAt: new Date()
  },
  { 
    id: 2, 
    username: 'manager_user', 
    email: 'manager@company.com', 
    password: '$2a$10$rqG5t6kqLlLqLlLqLlLqLuO5KqfL5KqfL5KqfL5Kq',
    role: 'manager', 
    isActive: true,
    managerId: null,
    createdAt: new Date()
  },
  { 
    id: 3, 
    username: 'emp_user', 
    email: 'employee@company.com', 
    password: '$2a$10$rqG5t6kqLlLqLlLqLlLqLuO5KqfL5KqfL5KqfL5Kq',
    role: 'employee', 
    isActive: true,
    managerId: 2,
    createdAt: new Date()
  }
];

let leaveTypes = [
  { id: 1, name: 'Casual Leave', annualQuota: 12 },
  { id: 2, name: 'Sick Leave', annualQuota: 10 },
  { id: 3, name: 'Earned Leave', annualQuota: 15 }
];

let leaveRequests = [
  {
    id: 1,
    userId: 3,
    leaveTypeId: 1,
    startDate: '2024-12-20',
    endDate: '2024-12-22',
    reason: 'Family function',
    status: 'pending',
    remark: null,
    actionedById: null,
    createdAt: new Date()
  },
  {
    id: 2,
    userId: 2,
    leaveTypeId: 1,
    startDate: '2024-12-25',
    endDate: '2024-12-26',
    reason: 'Personal work',
    status: 'pending',
    remark: null,
    actionedById: null,
    createdAt: new Date()
  }
];

let attendance = [];

const JWT_SECRET = 'your_secret_key_here';

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

// ============== AUTH ROUTES ==============
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username);
  
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  if (!user.isActive) {
    return res.status(401).json({ error: 'Account is deactivated' });
  }
  
  // Check password (plain text for demo)
  if (password !== 'password123') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  userLastActivity.set(user.id, Date.now());
  
  console.log('Login successful:', user.username, user.role);
  
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isActive: user.isActive
  });
});

// ============== USER ROUTES ==============
// HR only: View all users
app.get('/api/users', authMiddleware, checkRole(['hr']), (req, res) => {
  const usersWithoutPassword = users.map(u => {
    const { password, ...userWithoutPassword } = u;
    const manager = users.find(m => m.id === u.managerId);
    return {
      ...userWithoutPassword,
      Manager: manager ? { id: manager.id, username: manager.username } : null
    };
  });
  res.json(usersWithoutPassword);
});

// HR only: Create user
app.post('/api/users', authMiddleware, checkRole(['hr']), async (req, res) => {
  const { username, email, password, role, managerId } = req.body;
  
  const existingUser = users.find(u => u.username === username || u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Username or email already exists' });
  }
  
  const newUser = {
    id: users.length + 1,
    username,
    email,
    password: '$2a$10$rqG5t6kqLlLqLlLqLlLqLuO5KqfL5KqfL5KqfL5Kq',
    role: role || 'employee',
    managerId: managerId || null,
    isActive: true,
    createdAt: new Date()
  };
  
  users.push(newUser);
  
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

// HR only: Update user
app.put('/api/users/:id', authMiddleware, checkRole(['hr']), (req, res) => {
  const { id } = req.params;
  const { role, managerId, isActive } = req.body;
  
  const userIndex = users.findIndex(u => u.id === parseInt(id));
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  users[userIndex] = {
    ...users[userIndex],
    role: role || users[userIndex].role,
    managerId: managerId !== undefined ? managerId : users[userIndex].managerId,
    isActive: isActive !== undefined ? isActive : users[userIndex].isActive
  };
  
  const { password, ...userWithoutPassword } = users[userIndex];
  res.json(userWithoutPassword);
});

// Get managers list
app.get('/api/users/managers', authMiddleware, (req, res) => {
  const managers = users.filter(u => u.role === 'manager' && u.isActive);
  res.json(managers);
});

// ============== LEAVE TYPE ROUTES ==============
// All roles: View leave types
app.get('/api/leave-types', authMiddleware, (req, res) => {
  res.json(leaveTypes);
});

// HR only: Create leave type
app.post('/api/leave-types', authMiddleware, checkRole(['hr']), (req, res) => {
  const { name, annualQuota } = req.body;
  
  const existing = leaveTypes.find(lt => lt.name === name);
  if (existing) {
    return res.status(400).json({ error: 'Leave type already exists' });
  }
  
  const newLeaveType = {
    id: leaveTypes.length + 1,
    name,
    annualQuota: parseInt(annualQuota)
  };
  
  leaveTypes.push(newLeaveType);
  res.status(201).json(newLeaveType);
});

// HR only: Update leave type
app.put('/api/leave-types/:id', authMiddleware, checkRole(['hr']), (req, res) => {
  const { id } = req.params;
  const { name, annualQuota } = req.body;
  
  const typeIndex = leaveTypes.findIndex(lt => lt.id === parseInt(id));
  if (typeIndex === -1) {
    return res.status(404).json({ error: 'Leave type not found' });
  }
  
  leaveTypes[typeIndex] = {
    ...leaveTypes[typeIndex],
    name: name || leaveTypes[typeIndex].name,
    annualQuota: annualQuota || leaveTypes[typeIndex].annualQuota
  };
  
  res.json(leaveTypes[typeIndex]);
});

// HR only: Delete leave type
app.delete('/api/leave-types/:id', authMiddleware, checkRole(['hr']), (req, res) => {
  const { id } = req.params;
  
  const hasRequests = leaveRequests.some(lr => lr.leaveTypeId === parseInt(id));
  if (hasRequests) {
    return res.status(400).json({ error: 'Cannot delete leave type with existing requests' });
  }
  
  leaveTypes = leaveTypes.filter(lt => lt.id !== parseInt(id));
  res.json({ message: 'Leave type deleted successfully' });
});

// ============== LEAVE REQUEST ROUTES ==============
// HR only: View all leave requests
app.get('/api/leaves/all', authMiddleware, checkRole(['hr']), (req, res) => {
  const leavesWithDetails = leaveRequests.map(leave => {
    const user = users.find(u => u.id === leave.userId);
    const leaveType = leaveTypes.find(lt => lt.id === leave.leaveTypeId);
    return {
      ...leave,
      User: user ? { id: user.id, username: user.username, role: user.role } : null,
      LeaveType: leaveType
    };
  });
  res.json(leavesWithDetails);
});

// Employee & Manager: View own leave requests
app.get('/api/leaves/my', authMiddleware, (req, res) => {
  const myLeaves = leaveRequests.filter(leave => leave.userId === req.user.id);
  const leavesWithDetails = myLeaves.map(leave => {
    const leaveType = leaveTypes.find(lt => lt.id === leave.leaveTypeId);
    return {
      ...leave,
      LeaveType: leaveType
    };
  });
  res.json(leavesWithDetails);
});

// Manager only: View pending leaves of team members
app.get('/api/leaves/pending', authMiddleware, checkRole(['manager']), (req, res) => {
  const subordinates = users.filter(u => u.managerId === req.user.id);
  const subordinateIds = subordinates.map(s => s.id);
  
  const pendingLeaves = leaveRequests.filter(
    leave => subordinateIds.includes(leave.userId) && leave.status === 'pending'
  );
  
  const leavesWithDetails = pendingLeaves.map(leave => {
    const user = users.find(u => u.id === leave.userId);
    const leaveType = leaveTypes.find(lt => lt.id === leave.leaveTypeId);
    return {
      ...leave,
      User: user ? { id: user.id, username: user.username } : null,
      LeaveType: leaveType
    };
  });
  res.json(leavesWithDetails);
});

// Employee & Manager: Apply for leave
app.post('/api/leaves/apply', authMiddleware, checkRole(['employee', 'manager']), (req, res) => {
  const { leaveTypeId, startDate, endDate, reason } = req.body;
  
  const newLeave = {
    id: leaveRequests.length + 1,
    userId: req.user.id,
    leaveTypeId: parseInt(leaveTypeId),
    startDate,
    endDate,
    reason,
    status: 'pending',
    remark: null,
    actionedById: null,
    createdAt: new Date()
  };
  
  leaveRequests.push(newLeave);
  
  const leaveType = leaveTypes.find(lt => lt.id === parseInt(leaveTypeId));
  res.status(201).json({
    ...newLeave,
    LeaveType: leaveType
  });
});

// Manager only: Approve leave (cannot approve own leave)
app.put('/api/leaves/:id/approve', authMiddleware, checkRole(['manager']), (req, res) => {
  const { id } = req.params;
  const { remark } = req.body;
  
  const leaveIndex = leaveRequests.findIndex(l => l.id === parseInt(id));
  if (leaveIndex === -1) {
    return res.status(404).json({ error: 'Leave request not found' });
  }
  
  const leave = leaveRequests[leaveIndex];
  
  // Cannot approve own leave
  if (leave.userId === req.user.id) {
    return res.status(403).json({ error: 'You cannot approve your own leave request' });
  }
  
  const user = users.find(u => u.id === leave.userId);
  
  // Check if subordinate
  if (user.managerId !== req.user.id) {
    return res.status(403).json({ error: 'You can only approve leave of your team members' });
  }
  
  if (leave.status !== 'pending') {
    return res.status(400).json({ error: 'Leave already processed' });
  }
  
  leaveRequests[leaveIndex] = {
    ...leave,
    status: 'approved',
    remark,
    actionedById: req.user.id
  };
  
  res.json(leaveRequests[leaveIndex]);
});

// Manager only: Reject leave (cannot reject own leave)
app.put('/api/leaves/:id/reject', authMiddleware, checkRole(['manager']), (req, res) => {
  const { id } = req.params;
  const { remark } = req.body;
  
  const leaveIndex = leaveRequests.findIndex(l => l.id === parseInt(id));
  if (leaveIndex === -1) {
    return res.status(404).json({ error: 'Leave request not found' });
  }
  
  const leave = leaveRequests[leaveIndex];
  
  // Cannot reject own leave
  if (leave.userId === req.user.id) {
    return res.status(403).json({ error: 'You cannot reject your own leave request' });
  }
  
  const user = users.find(u => u.id === leave.userId);
  
  // Check if subordinate
  if (user.managerId !== req.user.id) {
    return res.status(403).json({ error: 'You can only reject leave of your team members' });
  }
  
  if (leave.status !== 'pending') {
    return res.status(400).json({ error: 'Leave already processed' });
  }
  
  leaveRequests[leaveIndex] = {
    ...leave,
    status: 'rejected',
    remark,
    actionedById: req.user.id
  };
  
  res.json(leaveRequests[leaveIndex]);
});

// ============== ATTENDANCE ROUTES ==============
// View own attendance (All roles)
app.get('/api/attendance/my', authMiddleware, (req, res) => {
  const myAttendance = attendance.filter(a => a.userId === req.user.id);
  res.json(myAttendance);
});

// Check today's status
app.get('/api/attendance/today', authMiddleware, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.find(
    a => a.userId === req.user.id && a.date === today
  );
  
  res.json({
    hasCheckedIn: !!todayAttendance?.checkIn,
    hasCheckedOut: !!todayAttendance?.checkOut,
    checkIn: todayAttendance?.checkIn,
    checkOut: todayAttendance?.checkOut
  });
});

// Check in (Employee & Manager only)
app.post('/api/attendance/checkin', authMiddleware, checkRole(['employee', 'manager']), (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const existing = attendance.find(
    a => a.userId === req.user.id && a.date === today
  );
  
  if (existing && existing.checkIn) {
    return res.status(400).json({ error: 'Already checked in today' });
  }
  
  const now = new Date();
  
  if (existing) {
    existing.checkIn = now;
    res.json(existing);
  } else {
    const newAttendance = {
      id: attendance.length + 1,
      userId: req.user.id,
      date: today,
      checkIn: now,
      checkOut: null,
      totalHours: 0
    };
    attendance.push(newAttendance);
    res.json(newAttendance);
  }
});

// Check out (Employee & Manager only)
app.post('/api/attendance/checkout', authMiddleware, checkRole(['employee', 'manager']), (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const record = attendance.find(
    a => a.userId === req.user.id && a.date === today
  );
  
  if (!record || !record.checkIn) {
    return res.status(400).json({ error: 'Must check in first' });
  }
  
  if (record.checkOut) {
    return res.status(400).json({ error: 'Already checked out today' });
  }
  
  const now = new Date();
  record.checkOut = now;
  res.json(record);
});

// View team attendance (Manager & HR)
app.get('/api/attendance/team', authMiddleware, checkRole(['manager', 'hr']), (req, res) => {
  let teamAttendance;
  
  if (req.user.role === 'hr') {
    teamAttendance = attendance;
  } else {
    const subordinates = users.filter(u => u.managerId === req.user.id);
    const subordinateIds = subordinates.map(s => s.id);
    teamAttendance = attendance.filter(a => subordinateIds.includes(a.userId));
  }
  
  const attendanceWithUsers = teamAttendance.map(a => {
    const user = users.find(u => u.id === a.userId);
    return {
      ...a,
      User: user ? { id: user.id, username: user.username } : null
    };
  });
  res.json(attendanceWithUsers);
});

// ============== DASHBOARD STATS ==============
app.get('/api/dashboard/stats', authMiddleware, (req, res) => {
  let stats = {};
  
  if (req.user.role === 'hr') {
    stats = {
      totalUsers: users.filter(u => u.isActive).length,
      pendingLeaves: leaveRequests.filter(l => l.status === 'pending').length,
      approvedLeaves: leaveRequests.filter(l => l.status === 'approved').length,
      totalLeaves: leaveRequests.length,
      totalLeaveTypes: leaveTypes.length
    };
  } else if (req.user.role === 'manager') {
    const subordinates = users.filter(u => u.managerId === req.user.id);
    const subordinateIds = subordinates.map(s => s.id);
    stats = {
      teamSize: subordinates.length,
      pendingLeaves: leaveRequests.filter(l => subordinateIds.includes(l.userId) && l.status === 'pending').length,
      myLeaves: leaveRequests.filter(l => l.userId === req.user.id).length
    };
  } else {
    stats = {
      myLeaves: leaveRequests.filter(l => l.userId === req.user.id).length,
      pendingLeaves: leaveRequests.filter(l => l.userId === req.user.id && l.status === 'pending').length,
      approvedLeaves: leaveRequests.filter(l => l.userId === req.user.id && l.status === 'approved').length
    };
  }
  
  res.json(stats);
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`\n📝 Login Credentials:`);
  console.log(`   👑 HR: hr_user / password123`);
  console.log(`   📊 Manager: manager_user / password123`);
  console.log(`   👤 Employee: emp_user / password123`);
});