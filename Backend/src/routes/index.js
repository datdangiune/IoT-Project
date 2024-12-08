const express = require('express');
const router = express.Router();

router.use('/parking-lot', require('./parking-lot'));
router.use('/ping', require('./ping'));
router.use('/', require('./entryExit')); // Add this line

module.exports = router;