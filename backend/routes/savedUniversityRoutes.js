const express = require('express');
const {
  saveUniversity,
  unsaveUniversity,
  getSavedUniversities,
  checkSaved
} = require('../controllers/savedUniversityController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.post('/', protect, saveUniversity);
router.delete('/:universityId', protect, unsaveUniversity);
router.get('/', protect, getSavedUniversities);
router.get('/check/:universityId', protect, checkSaved);

module.exports = router;



