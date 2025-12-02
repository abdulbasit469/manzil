const express = require('express');
const {
  getAllUsers,
  getUser,
  updateUserRole,
  deleteUser,
  getStats,
  getAllAssessments,
  getAllMeritCriteria,
  getMeritCriteria,
  createMeritCriteria,
  updateMeritCriteria,
  deleteMeritCriteria
} = require('../controllers/adminController');
const {
  createProgram,
  updateProgram,
  deleteProgram
} = require('../controllers/programController');
const {
  createUniversity,
  updateUniversity,
  deleteUniversity
} = require('../controllers/universityController');
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

// Merit Criteria routes
router.get('/merit-criteria', getAllMeritCriteria);
router.get('/merit-criteria/:id', getMeritCriteria);
router.post('/merit-criteria', createMeritCriteria);
router.put('/merit-criteria/:id', updateMeritCriteria);
router.delete('/merit-criteria/:id', deleteMeritCriteria);

// Program routes
router.post('/programs', createProgram);
router.put('/programs/:id', updateProgram);
router.delete('/programs/:id', deleteProgram);

// University routes
router.post('/universities', createUniversity);
router.put('/universities/:id', updateUniversity);
router.delete('/universities/:id', deleteUniversity);

module.exports = router;




