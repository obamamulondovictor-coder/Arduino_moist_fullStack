const express = require('express');
const router = express.Router();
const soilController = require('../Controllers/soildContoller.controller');

// POST /soil/status
router.post('/status', soilController.postSoilStatus);

module.exports = router;