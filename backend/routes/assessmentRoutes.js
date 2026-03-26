const express = require('express');
const { 
  getQuestions, 
  submitAssessment, 
  getResults,
  getInterestDetails,
  getPersonalityQuestions,
  submitPersonalityTest,
  getMBTIDetails,
  getBrainQuestions,
  submitBrainTest,
  getBrainDetails,
  getAptitudeQuestions,
  submitAptitudeTest,
  submitCompleteAssessment,
  getAssessmentStatus
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Interest Test endpoints (backward compatible, now expanded)
router.get('/questions', protect, getQuestions);
router.get('/interest/questions', protect, getQuestions);
router.get('/interest/details', protect, getInterestDetails);
router.post('/submit', protect, submitAssessment);
router.post('/interest/submit', protect, submitAssessment);
router.get('/results', protect, getResults);

// Personality Test endpoints (MBTI)
router.get('/personality/questions', protect, getPersonalityQuestions);
router.post('/personality/submit', protect, submitPersonalityTest);
router.get('/personality/mbti/:mbtiType/details', protect, getMBTIDetails);

// Brain Hemisphere Test endpoints (OHBDS)
router.get('/brain/questions', protect, getBrainQuestions);
router.post('/brain/submit', protect, submitBrainTest);
router.get('/brain/:dominance/details', protect, getBrainDetails);

// Aptitude Test endpoints
router.get('/aptitude/questions', protect, getAptitudeQuestions);
router.post('/aptitude/submit', protect, submitAptitudeTest);

// Complete Assessment endpoints (all 3 tests)
router.post('/submit-complete', protect, submitCompleteAssessment);
router.get('/status', protect, getAssessmentStatus);

module.exports = router;






