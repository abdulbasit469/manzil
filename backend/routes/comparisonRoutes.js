const express = require('express');
const { compare } = require('../controllers/comparisonController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);
router.post('/', compare);

module.exports = router;
