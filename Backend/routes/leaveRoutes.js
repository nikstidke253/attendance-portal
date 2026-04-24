const express = require('express');
const {
  applyLeave,
  getMyLeaves,
  getPendingLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave
} = require('../controllers/leaveController');
const { authMiddleware, checkRole } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

router.post('/apply', checkRole(['employee', 'manager']), applyLeave);
router.get('/my', getMyLeaves);
router.get('/pending', checkRole(['manager']), getPendingLeaves);
router.get('/all', checkRole(['hr']), getAllLeaves);
router.put('/:id/approve', checkRole(['manager', 'hr']), approveLeave);
router.put('/:id/reject', checkRole(['manager', 'hr']), rejectLeave);

module.exports = router;