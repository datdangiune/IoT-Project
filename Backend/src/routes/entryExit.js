const express = require('express');
const router = express.Router();
const { entry, exit } = require('../controllers/entryExit.controller');

router.post('/entry', entry);
router.post('/exit', exit);

module.exports = router;