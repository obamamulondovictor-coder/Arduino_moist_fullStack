const express = require('express');
const router = express.Router();
const deviceController = require('../Controllers/device.controller');

// POST /device/register
router.post('/register', deviceController.recordDeviceDetails);
router.put("/status" , deviceController.changeDeviceMode)

module.exports = router;


