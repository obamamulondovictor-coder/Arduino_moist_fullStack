const db = require("../config/db");

const DEFAULT_SETTINGS = {
  startThreshold: 30,
  stopThreshold: 45,
  maxRuntimeSeconds: 90,
  cooldownSeconds: 60,
  minTankLevel: 12,
  staleAfterSeconds: 30,
};

function numeric(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toMillis(value) {
  if (!value) return null;
  const parsed = value instanceof Date ? value.getTime() : Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function toTimestamp(value) {
  return toMillis(value) ?? Date.now();
}

function mapSettings(row) {
  if (!row) return { ...DEFAULT_SETTINGS };
  return {
    startThreshold: numeric(row.start_threshold) ?? DEFAULT_SETTINGS.startThreshold,
    stopThreshold: numeric(row.stop_threshold) ?? DEFAULT_SETTINGS.stopThreshold,
    maxRuntimeSeconds:
      numeric(row.max_runtime_seconds) ?? DEFAULT_SETTINGS.maxRuntimeSeconds,
    cooldownSeconds:
      numeric(row.cooldown_seconds) ?? DEFAULT_SETTINGS.cooldownSeconds,
    minTankLevel: numeric(row.min_tank_level) ?? DEFAULT_SETTINGS.minTankLevel,
    staleAfterSeconds:
      numeric(row.stale_after_seconds) ?? DEFAULT_SETTINGS.staleAfterSeconds,
  };
}

async function getSnapshot(deviceId) {
  const [deviceRows] = await db.execute("SELECT * FROM devices WHERE device_id = ?", [
    deviceId,
  ]);
  if (deviceRows.length === 0) return null;

  const device = deviceRows[0];

  let settingsRow = null;
  try {
    const [rows] = await db.execute(
      "SELECT * FROM irrigation_settings WHERE device_id = ?",
      [deviceId],
    );
    settingsRow = rows[0] ?? null;
  } catch (error) {
    console.error("Snapshot settings lookup failed:", error.message);
  }

  const [readingRows] = await db.execute(
    `SELECT * FROM soil_readings
     WHERE device_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [deviceId],
  );
  const latest = readingRows[0] ?? null;

  const [historyRows] = await db.execute(
    `SELECT * FROM (
       SELECT * FROM soil_readings
       WHERE device_id = ?
       ORDER BY created_at DESC
       LIMIT 48
     ) recent
     ORDER BY created_at ASC`,
    [deviceId],
  );

  let alertRows = [];
  try {
    const [rows] = await db.execute(
      `SELECT * FROM soil_alerts
       WHERE device_id = ?
       ORDER BY created_at DESC
       LIMIT 20`,
      [deviceId],
    );
    alertRows = rows;
  } catch (error) {
    console.error("Snapshot alerts lookup failed:", error.message);
  }

  const settings = mapSettings(settingsRow);
  const readingAt = toMillis(latest?.created_at);
  const status = String(device.status ?? "active").toLowerCase();
  const deviceReachable = status === "active" || status === "online";
  const online =
    deviceReachable &&
    readingAt !== null &&
    Date.now() - readingAt <= settings.staleAfterSeconds * 1000;

  const rawPump = latest?.pump_state ?? device.pump_state;
  const pumpStatus = rawPump === "ON" ? "ON" : rawPump === "OFF" ? "OFF" : "UNKNOWN";
  const mode = String(device.operating_mode ?? "auto").toLowerCase() === "manual"
    ? "MANUAL"
    : "AUTO";

  return {
    telemetry: {
      deviceId,
      soilMoisture: numeric(latest?.moisture),
      airTemperature: numeric(latest?.temperature),
      airHumidity: numeric(latest?.air_humidity),
      tankLevel: numeric(latest?.tank_level),
      sensorValid: latest ? Number(latest.sensor_valid ?? 1) !== 0 : false,
      signalStrength: numeric(latest?.signal_strength) ?? 0,
      timestamp: readingAt ?? Date.now(),
    },
    pumpStatus,
    mode,
    online,
    pumpStartedAt: toMillis(latest?.pump_started_at ?? device.pump_started_at),
    cooldownUntil: toMillis(device.cooldown_until),
    fault: device.fault ?? null,
    faultAt: toMillis(device.fault_at),
    settings,
    alerts: alertRows.map((row) => ({
      id: String(row.id),
      code: row.code ?? "DRY_SOIL",
      severity: row.severity ?? "warning",
      title: row.title ?? "Low soil moisture",
      message: row.alert_message ?? row.message ?? "Soil moisture is below the safe range.",
      timestamp: toTimestamp(row.created_at),
    })),
    events: [],
    history: historyRows.map((row) => ({
      timestamp: toTimestamp(row.created_at),
      moisture: numeric(row.moisture),
      tank: numeric(row.tank_level),
      pumpOn: row.pump_state === "ON",
    })),
    lastSync: readingAt ?? toMillis(device.last_seen),
    controlReason:
      latest?.control_reason ||
      device.control_reason ||
      (pumpStatus === "ON"
        ? "Pump running — automatic irrigation active."
        : "Standby — monitoring soil moisture."),
    firmware: device.firmware_version || latest?.firmware_version || "--",
    deviceName: device.device_name || `ESP32-${deviceId}`,
  };
}

module.exports = { getSnapshot, DEFAULT_SETTINGS, mapSettings };
