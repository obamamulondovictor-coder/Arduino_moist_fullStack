const soilService = require("../Service/soilService.service");
const snapshotService = require("../Service/snapshot.service");
const realtime = require("../Service/realtime.service");

async function getSoilStatus(req, res) {
  try {
    const body = req.body || {};
    const deviceId = body.device_id;
    const moisture = body.moisture;
    const temperature = body.temperature;

    if (!deviceId || moisture === undefined || temperature === undefined) {
      return res.status(400).json({
        success: false,
        message: "device_id, moisture and temperature are required",
      });
    }

    const forwarded = req.headers && req.headers["x-forwarded-for"];
    const sourceIp =
      (typeof forwarded === "string" && forwarded.split(",")[0].trim()) ||
      req.ip ||
      null;
    const ipAddress = body.ip_address || sourceIp;

    const result = await soilService.recordSoilReading({
      device_id: deviceId,
      moisture,
      temperature,
      mode: body.mode,
      device_name: body.device_name,
      ip_address: ipAddress,
      operating_mode: body.operating_mode,
      pump_state: body.pump_state,
      location: body.location,
      status: body.status,
      tank_level: body.tank_level,
      air_humidity: body.air_humidity,
      signal_strength: body.signal_strength,
      sensor_valid: body.sensor_valid,
      pump_started_at: body.pump_started_at,
      control_reason: body.control_reason,
      firmware_version: body.firmware_version,
    });

    return res.status(201).json({
      success: true,
      message: result.autoRegistered
        ? "Soil reading recorded and device auto-registered"
        : "Soil reading recorded successfully",
      device_id: String(deviceId),
      insertId: result.insertId,
      autoRegistered: result.autoRegistered,
      alertCreated: result.alertCreated,
    });
  } catch (error) {
    console.error("getSoilStatus error:", error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message:
        status === 400 ? error.message : "Failed to record soil reading",
    });
  }
}

async function getLatest(req, res) {
  try {
    const data = await soilService.getLatestReadings();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getLatest error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch latest readings",
    });
  }
}

async function getReadings(req, res) {
  try {
    const deviceId = req.params.device_id;
    const limit = req.query.limit;
    const data = await soilService.getReadingsByDevice(deviceId, limit);
    return res.status(200).json({ success: true, device_id: deviceId, data });
  } catch (error) {
    console.error("getReadings error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch readings",
    });
  }
}

async function getAlerts(req, res) {
  try {
    const limit = req.query.limit;
    const data = await soilService.getAlerts(limit);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getAlerts error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch alerts",
    });
  }
}

async function getSnapshot(req, res) {
  try {
    const snapshot = await snapshotService.getSnapshot(req.params.device_id);
    if (!snapshot) {
      return res.status(404).json({
        success: false,
        message: "Device is not registered yet",
      });
    }
    return res.status(200).json({ success: true, data: snapshot });
  } catch (error) {
    console.error("getSnapshot error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to load device snapshot",
    });
  }
}

function streamSnapshot(req, res) {
  return realtime.subscribe(
    req.params.device_id,
    res,
    req.headers["last-event-id"],
  );
}

module.exports = {
  getSoilStatus,
  getLatest,
  getReadings,
  getAlerts,
  getSnapshot,
  streamSnapshot,
};
