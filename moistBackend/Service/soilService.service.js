const db = require("../config/db");
const deviceService = require("./device.service");

const DRY_THRESHOLD = 30.0;

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function recordSoilReading(data) {
  const deviceId = data.device_id ? String(data.device_id).trim() : "";
  const moisture = toNumber(data.moisture);
  const temperature = toNumber(data.temperature);
  const mode = data.mode ? String(data.mode).trim() : "standard";

  if (!deviceId) {
    const error = new Error("device_id is required");
    error.statusCode = 400;
    throw error;
  }
  if (moisture === null || temperature === null) {
    const error = new Error("moisture and temperature are required");
    error.statusCode = 400;
    throw error;
  }

  const deviceResult = await deviceService.ensureDevice({
    device_id: deviceId,
    device_name: data.device_name,
    ip_address: data.ip_address,
    operating_mode: data.operating_mode,
    pump_state: data.pump_state,
    location: data.location,
    status: data.status,
  });

  const [result] = await db.execute(
    "INSERT INTO soil_readings (device_id, moisture, temperature, mode) VALUES (?, ?, ?, ?)",
    [deviceId, moisture, temperature, mode || "standard"]
  );

  let alertCreated = false;
  if (moisture < DRY_THRESHOLD) {
    await db.execute(
      "INSERT INTO soil_alerts (device_id, moisture_level, alert_message) VALUES (?, ?, ?)",
      [
        deviceId,
        moisture,
        "Soil moisture critically low - watering recommended",
      ]
    );
    alertCreated = true;
  }

  return {
    insertId: result.insertId,
    autoRegistered: deviceResult.created,
    alertCreated,
  };
}

async function getLatestReadings() {
  const [rows] = await db.execute(
    `SELECT sr.id, sr.device_id, d.device_name, sr.moisture, sr.temperature, sr.mode, sr.created_at
     FROM soil_readings sr
     INNER JOIN (
       SELECT device_id, MAX(created_at) AS max_created
       FROM soil_readings
       GROUP BY device_id
     ) latest ON sr.device_id = latest.device_id AND sr.created_at = latest.max_created
     LEFT JOIN devices d ON sr.device_id = d.device_id
     ORDER BY sr.created_at DESC`
  );
  return rows;
}

async function getReadingsByDevice(deviceId, limit) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 500));
  const [rows] = await db.execute(
    `SELECT id, device_id, moisture, temperature, mode, created_at
     FROM soil_readings
     WHERE device_id = ?
     ORDER BY created_at DESC
     LIMIT ${safeLimit}`,
    [deviceId]
  );
  return rows;
}

async function getAlerts(limit) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 500));
  const [rows] = await db.execute(
    `SELECT sa.id, sa.device_id, d.device_name, sa.moisture_level, sa.alert_message, sa.created_at
     FROM soil_alerts sa
     LEFT JOIN devices d ON sa.device_id = d.device_id
     ORDER BY sa.created_at DESC
     LIMIT ${safeLimit}`
  );
  return rows;
}

module.exports = {
  recordSoilReading,
  getLatestReadings,
  getReadingsByDevice,
  getAlerts,
  DRY_THRESHOLD,
};
