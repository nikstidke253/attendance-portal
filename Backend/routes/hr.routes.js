const router = require('express').Router();
const { User, LeaveType } = require('../models');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// ✅ CREATE USER
router.post('/create', auth, role(['HR']), async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});

// ✅ GET USERS
router.get('/users', auth, role(['HR']), async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

// ✅ DEACTIVATE USER
router.post('/deactivate/:id', auth, role(['HR']), async (req, res) => {
  const user = await User.findByPk(req.params.id);
  user.isActive = false;
  await user.save();
  res.json(user);
});

// ✅ CREATE LEAVE TYPE
router.post('/leave-type', auth, role(['HR']), async (req, res) => {
  const type = await LeaveType.create(req.body);
  res.json(type);
});

// ✅ GET LEAVE TYPES
router.get('/leave-type', auth, role(['HR']), async (req, res) => {
  const types = await LeaveType.findAll();
  res.json(types);
});

module.exports = router;