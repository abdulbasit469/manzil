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
const { getCached, setCached } = require('../utils/simpleCache');

const router = express.Router();

// Public routes - IMPORTANT: More specific routes must come before parameterized routes
router.get('/cities', async (req, res) => {
  try {
    const cached = getCached('uni:cities');
    if (cached) return res.status(200).json(cached);

    const University = require('../models/University');
    const query = {
      $or: [
        { isActive: true },
        { isActive: { $exists: false } },
        { isActive: null }
      ]
    };
    const cities = await University.distinct('city', query);
    const payload = {
      success: true,
      cities: cities.filter(city => city).sort()
    };
    setCached('uni:cities', payload, 600_000); // 10 min — cities rarely change
    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get('/', getAllUniversities);
router.get('/:id/programs', getUniversityPrograms);
router.get('/:id', getUniversity);

// Admin routes
router.post('/', protect, authorize('admin'), createUniversity);
router.put('/:id', protect, authorize('admin'), updateUniversity);
router.delete('/:id', protect, authorize('admin'), deleteUniversity);

module.exports = router;










