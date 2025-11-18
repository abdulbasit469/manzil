const express = require('express');
const {
  getProfile,
  updateProfile,
  getProfileCompletion,
  getDashboard
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.get('/completion', protect, getProfileCompletion);

module.exports = router;






