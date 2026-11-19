const express = require("express");
const router = express.Router();
const soilController = require("../Controllers/soildContoller.controller");

router.post("/status", soilController.getSoilStatus);
router.get("/latest", soilController.getLatest);
router.get("/readings/:device_id", soilController.getReadings);
router.get("/alerts", soilController.getAlerts);

module.exports = router;
