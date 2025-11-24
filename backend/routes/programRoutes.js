const express = require('express');
const {
  createProgram,
  updateProgram,
  deleteProgram,
  getAllPrograms,
  getProgram
} = require('../controllers/programController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllPrograms);
router.get('/:id', getProgram);

// Admin routes
router.post('/', protect, authorize('admin'), createProgram);
router.put('/:id', protect, authorize('admin'), updateProgram);
router.delete('/:id', protect, authorize('admin'), deleteProgram);

module.exports = router;










