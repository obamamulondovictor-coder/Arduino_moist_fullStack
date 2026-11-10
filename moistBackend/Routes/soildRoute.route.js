const express = require('express');
const router = express.Router();
const soilController = require('../Controllers/soildContoller.controller');
const deviceController = require('../Controllers/device.controller');


// POST /soil/status
router.post('/status', soilController.getSoilStatus);

module.exports = router;