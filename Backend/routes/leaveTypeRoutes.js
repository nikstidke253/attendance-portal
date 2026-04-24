const express = require('express');
const {
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType
} = require('../controllers/leaveTypeController');
const { authMiddleware, checkRole } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

router.get('/', getLeaveTypes);
router.post('/', checkRole(['hr']), createLeaveType);
router.put('/:id', checkRole(['hr']), updateLeaveType);
router.delete('/:id', checkRole(['hr']), deleteLeaveType);

module.exports = router;