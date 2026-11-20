const db = require("../config/db");
const deviceService = require("./device.service");
const realtime = require("./realtime.service");

const DRY_THRESHOLD = 30.0;

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toPumpState(value) {
  if (value === undefined || value === null || value === "") return null;
  const normalized = String(value).trim().toUpperCase();
  if (normalized === "ON" || normalized === "1" || normalized === "TRUE") return "ON";
  if (normalized === "OFF" || normalized === "0" || normalized === "FALSE") return "OFF";
  return null;
}

function toSensorValid(value) {
  if (value === undefined || value === null) return 1;
  if (value === false || value === 0 || String(value).toLowerCase() === "false") return 0;
  return 1;
}

function cleanText(value, limit = 255) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text ? text.slice(0, limit) : null;
}

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
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
    firmware_version: data.firmware_version,
  });

  let result;
  try {
    [result] = await db.execute(
      `INSERT INTO soil_readings
         (device_id, moisture, temperature, mode, tank_level, air_humidity,
          signal_strength, sensor_valid, pump_state, pump_started_at,
          control_reason, firmware_version)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        deviceId,
        moisture,
        temperature,
        mode || "standard",
        toNumber(data.tank_level),
        toNumber(data.air_humidity),
        toNumber(data.signal_strength),
        toSensorValid(data.sensor_valid),
        toPumpState(data.pump_state),
        toDate(data.pump_started_at),
        cleanText(data.control_reason),
        cleanText(data.firmware_version, 50),
      ],
    );
  } catch (error) {
    if (!/unknown column/i.test(error.message)) throw error;
    [result] = await db.execute(
      "INSERT INTO soil_readings (device_id, moisture, temperature, mode) VALUES (?, ?, ?, ?)",
      [deviceId, moisture, temperature, mode || "standard"],
    );
  }

  let alertCreated = false;
  if (moisture < DRY_THRESHOLD) {
    await db.execute(
      "INSERT INTO soil_alerts (device_id, moisture_level, alert_message) VALUES (?, ?, ?)",
      [deviceId, moisture, "Soil moisture critically low - watering recommended"],
    );
    alertCreated = true;
  }

  realtime.publish(deviceId, {
    reason: "telemetry",
    at: Date.now(),
    moisture,
    temperature,
  });

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
     ORDER BY sr.created_at DESC`,
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
    [deviceId],
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
     LIMIT ${safeLimit}`,
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
