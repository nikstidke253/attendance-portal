const express = require('express');
const {
  getAllUsers,
  createUser,
  updateUser,
  getManagers
} = require('../controllers/userController');
const { authMiddleware, checkRole } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

router.get('/', checkRole(['hr']), getAllUsers);
router.post('/', checkRole(['hr']), createUser);
router.put('/:id', checkRole(['hr']), updateUser);
router.get('/managers', getManagers);

module.exports = router;