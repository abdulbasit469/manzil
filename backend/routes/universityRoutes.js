const express = require('express');
const {
  createUniversity,
  updateUniversity,
  deleteUniversity,
  getAllUniversities,
  getUniversity,
  getUniversityPrograms
} = require('../controllers/universityController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllUniversities);
router.get('/:id', getUniversity);
router.get('/:id/programs', getUniversityPrograms);

// Admin routes
router.post('/', protect, authorize('admin'), createUniversity);
router.put('/:id', protect, authorize('admin'), updateUniversity);
router.delete('/:id', protect, authorize('admin'), deleteUniversity);

module.exports = router;






