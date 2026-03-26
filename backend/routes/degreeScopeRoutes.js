const express = require('express');
const { getList, getById, getProgramsForDegree, runSeed } = require('../controllers/degreeScopeController');

const router = express.Router();

router.post('/seed', runSeed);
router.get('/', getList);
router.get('/:id', getById);
router.get('/:id/programs', getProgramsForDegree);

module.exports = router;
