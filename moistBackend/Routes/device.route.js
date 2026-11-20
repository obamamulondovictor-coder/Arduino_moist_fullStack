const express = require("express");
const router = express.Router();
const deviceController = require("../Controllers/device.controller");

router.post("/register", deviceController.recordDeviceDetails);
router.put("/status", deviceController.changeDeviceMode);
router.put("/mode", deviceController.changeDeviceMode);
router.post("/status/:device_id", deviceController.setDeviceStatus);
router.post("/command/:device_id", deviceController.setDeviceStatus);
router.get("/stream/:device_id", deviceController.streamDevice);
router.get("/", deviceController.getDevices);
router.get("/:device_id", deviceController.getDevice);
router.put("/:device_id", deviceController.updateDevice);
router.delete("/:device_id", deviceController.deleteDevice);

module.exports = router;
