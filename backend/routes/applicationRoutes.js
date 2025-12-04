const express = require('express');
const {
  submitApplication,
  getApplications,
  getApplication,
  updateApplication,
  deleteApplication
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.post('/', protect, submitApplication);
router.get('/', protect, getApplications);
router.get('/:applicationId', protect, getApplication);
router.put('/:applicationId', protect, updateApplication);
router.delete('/:applicationId', protect, deleteApplication);

module.exports = router;



