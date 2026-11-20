const express = require("express");
const router = express.Router();
const soilController = require("../Controllers/soildContoller.controller");

router.post("/status", soilController.getSoilStatus);
router.get("/latest", soilController.getLatest);
router.get("/readings/:device_id", soilController.getReadings);
router.get("/alerts", soilController.getAlerts);
router.get("/snapshot/:device_id", soilController.getSnapshot);
router.get("/stream/:device_id", soilController.streamSnapshot);

module.exports = router;
