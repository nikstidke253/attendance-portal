const express = require('express');
const {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyAttendance,
  getTeamAttendance
} = require('../controllers/attendanceController');
const { authMiddleware, checkRole } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

router.post('/checkin', checkRole(['employee', 'manager']), checkIn);
router.post('/checkout', checkRole(['employee', 'manager']), checkOut);
router.get('/today', checkRole(['employee', 'manager']), getTodayStatus);
router.get('/my', getMyAttendance);
router.get('/team', checkRole(['manager']), getTeamAttendance);

module.exports = router;