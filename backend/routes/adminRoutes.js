const express = require('express');
const {
  getAllUsers,
  getUser,
  updateUserRole,
  deleteUser,
  getStats,
  getAllAssessments
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authorization
router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/stats', getStats);
router.get('/assessments', getAllAssessments);

module.exports = router;




