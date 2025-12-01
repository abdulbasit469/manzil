const express = require('express');
const {
  calculateMerit,
  getCriteria,
  getUniversityCriteria
} = require('../controllers/meritController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Calculate merit
router.post('/calculate', calculateMerit);

// Get criteria
router.get('/criteria/:universityId/:programId', getCriteria);
router.get('/criteria/university/:universityId', getUniversityCriteria);

module.exports = router;



