const express = require('express');
const { getFAQList, ask, getStatus } = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/status', protect, getStatus);
router.get('/faq', protect, getFAQList);
router.post('/ask', protect, ask);

module.exports = router;
