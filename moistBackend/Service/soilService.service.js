const db = require("../config/db");
const deviceService = require("./device.service");
const realtime = require("./realtime.service");

const DRY_THRESHOLD = 30.0;
const DB_CHANGE_TOLERANCE = 0.1;

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

function numericChanged(nextValue, previousValue) {
  if (nextValue === null || nextValue === undefined) {
    return previousValue !== null && previousValue !== undefined;
  }
  if (previousValue === null || previousValue === undefined) return true;
  return Math.abs(Number(nextValue) - Number(previousValue)) > DB_CHANGE_TOLERANCE;
}

function exactChanged(nextValue, previousValue) {
  return nextValue !== previousValue;
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

  const tankLevel = toNumber(data.tank_level);
  const airHumidity = toNumber(data.air_humidity);
  const signalStrength = toNumber(data.signal_strength);
  const sensorValid = toSensorValid(data.sensor_valid);
  const pumpState = toPumpState(data.pump_state);
  const pumpStartedAt = toDate(data.pump_started_at);
  const controlReason = cleanText(data.control_reason);
  const firmwareVersion = cleanText(data.firmware_version, 50);
  const readingMode = mode || "standard";

  const [latestRows] = await db.execute(
    `SELECT moisture, temperature, tank_level, pump_state, mode, sensor_valid, firmware_version
     FROM soil_readings
     WHERE device_id = ?
     ORDER BY id DESC
     LIMIT 1`,
    [deviceId],
  );
  const latest = latestRows[0] || null;
  const changedFields = [];

  if (!latest || numericChanged(moisture, latest.moisture)) changedFields.push("moisture");
  if (!latest || numericChanged(temperature, latest.temperature)) changedFields.push("temperature");
  if (!latest || numericChanged(tankLevel, latest.tank_level)) changedFields.push("tank_level");
  if (!latest || exactChanged(pumpState, latest.pump_state)) changedFields.push("pump_state");
  if (!latest || exactChanged(readingMode, latest.mode)) changedFields.push("mode");
  if (
    !latest ||
    exactChanged(sensorValid, latest.sensor_valid === null || latest.sensor_valid === undefined ? null : Number(latest.sensor_valid))
  ) {
    changedFields.push("sensor_valid");
  }
  if (!latest || exactChanged(firmwareVersion, latest.firmware_version)) {
    changedFields.push("firmware_version");
  }

  const dbWritten = changedFields.length > 0;
  let result = null;
  if (dbWritten) {
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
          readingMode,
          tankLevel,
          airHumidity,
          signalStrength,
          sensorValid,
          pumpState,
          pumpStartedAt,
          controlReason,
          firmwareVersion,
        ],
      );
    } catch (error) {
      if (!/unknown column/i.test(error.message)) throw error;
      [result] = await db.execute(
        "INSERT INTO soil_readings (device_id, moisture, temperature, mode) VALUES (?, ?, ?, ?)",
        [deviceId, moisture, temperature, readingMode],
      );
    }
  }

  let alertCreated = false;
  if (moisture < DRY_THRESHOLD) {
    const [alertRows] = await db.execute(
      `SELECT moisture_level FROM soil_alerts
       WHERE device_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [deviceId],
    );
    const lastAlert = alertRows[0]?.moisture_level;
    const wasDry =
      lastAlert !== null &&
      lastAlert !== undefined &&
      Number.isFinite(Number(lastAlert)) &&
      Number(lastAlert) < DRY_THRESHOLD;

    if (!wasDry) {
      await db.execute(
        "INSERT INTO soil_alerts (device_id, moisture_level, alert_message) VALUES (?, ?, ?)",
        [deviceId, moisture, "Soil moisture critically low - watering recommended"],
      );
      alertCreated = true;
    }
  }

  realtime.publishEvent(deviceId, "telemetry", {
    deviceId,
    moisture,
    temperature,
    tankLevel,
    airHumidity,
    signalStrength,
    sensorValid: Boolean(sensorValid),
    mode: readingMode,
    pumpState,
    firmwareVersion,
    at: Date.now(),
    dbWritten,
    changedFields,
  });

  return {
    insertId: result?.insertId ?? null,
    autoRegistered: deviceResult.created,
    alertCreated,
    dbWritten,
    changedFields,
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
