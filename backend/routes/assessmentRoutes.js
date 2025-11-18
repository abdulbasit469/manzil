const express = require('express');
const { 
  getQuestions, 
  submitAssessment, 
  getResults,
  getPersonalityQuestions,
  submitPersonalityTest,
  getAptitudeQuestions,
  submitAptitudeTest,
  submitCompleteAssessment,
  getAssessmentStatus
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Interest Test endpoints (backward compatible, now expanded)
router.get('/questions', protect, getQuestions);
router.get('/interest/questions', protect, getQuestions); // Alias for clarity
router.post('/submit', protect, submitAssessment);
router.post('/interest/submit', protect, submitAssessment); // Alias for clarity
router.get('/results', protect, getResults);

// Personality Test endpoints
router.get('/personality/questions', protect, getPersonalityQuestions);
router.post('/personality/submit', protect, submitPersonalityTest);

// Aptitude Test endpoints
router.get('/aptitude/questions', protect, getAptitudeQuestions);
router.post('/aptitude/submit', protect, submitAptitudeTest);

// Complete Assessment endpoints (all 3 tests)
router.post('/submit-complete', protect, submitCompleteAssessment);
router.get('/status', protect, getAssessmentStatus);

module.exports = router;






