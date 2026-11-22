const db = require("../config/db");

const MAX_DEVICE_ID_LENGTH = 255;
const MAX_DEVICE_NAME_LENGTH = 255;

function cleanString(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  if (!str) return null;
  return str;
}

function cleanDeviceId(value) {
  const deviceId = cleanString(value);
  if (!deviceId || deviceId.length > MAX_DEVICE_ID_LENGTH) return null;
  return deviceId;
}

function cleanDeviceName(value) {
  const deviceName = cleanString(value);
  if (!deviceName || deviceName.length > MAX_DEVICE_NAME_LENGTH) return null;
  return deviceName;
}

async function ensureDevice(data) {
  const rawDeviceId = data.device_id;
  const rawDeviceName = data.device_name;
  const deviceId = cleanDeviceId(rawDeviceId);
  const deviceNameValue = cleanDeviceName(rawDeviceName);
  const badName = String(rawDeviceName || "").trim() && !deviceNameValue;

  if (!deviceId || badName) {
    console.warn(
      `Device setup rejected: device_id=${JSON.stringify(String(rawDeviceId || "").slice(0, MAX_DEVICE_ID_LENGTH + 1))} device_name=${JSON.stringify(String(rawDeviceName || "").slice(0, MAX_DEVICE_NAME_LENGTH + 1))}`,
    );
    const error = new Error(
      !deviceId
        ? "device_id is required or longer than 255 characters"
        : "device_name is longer than 255 characters",
    );
    error.statusCode = 400;
    throw error;
  }

  const deviceName = deviceNameValue || `ESP32-${deviceId}`;

  const [rows] = await db.execute("SELECT * FROM devices WHERE device_id = ?", [
    deviceId,
  ]);

  const ipAddress = cleanString(data.ip_address);
  const operatingMode =
    data.operating_mode === "manual" ? "manual" : "auto";
  const pumpState = data.pump_state === "ON" ? "ON" : "OFF";
  const location = cleanString(data.location);
  const status = cleanString(data.status) || "active";

  if (rows.length === 0) {
    await db.execute(
      `INSERT INTO devices (device_id, device_name, ip_address, operating_mode, pump_state, location, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        deviceId,
        deviceName,
        ipAddress,
        operatingMode,
        pumpState,
        location,
        status,
      ]
    );
    return { created: true, device_id: deviceId, updated: true };
  }

  const existing = rows[0];
  const next = {
    device_name: deviceNameValue || existing.device_name || deviceName,
    ip_address: ipAddress !== null ? ipAddress : existing.ip_address,
    operating_mode: data.operating_mode
      ? operatingMode
      : existing.operating_mode || "auto",
    pump_state: data.pump_state
      ? pumpState
      : existing.pump_state || "OFF",
    location: location !== null ? location : existing.location,
    status: data.status ? status : existing.status || "active",
  };

  const changed = Object.keys(next).some(
    (key) => next[key] !== existing[key],
  );
  if (!changed) return { created: false, device_id: deviceId, updated: false };

  await db.execute(
    `UPDATE devices
     SET device_name = ?, ip_address = ?, operating_mode = ?, pump_state = ?, location = ?, status = ?
     WHERE device_id = ?`,
    [
      next.device_name,
      next.ip_address,
      next.operating_mode,
      next.pump_state,
      next.location,
      next.status,
      deviceId,
    ]
  );
  return { created: false, device_id: deviceId, updated: true };
}

async function recordDevice(data) {
  const result = await ensureDevice(data);
  return {
    success: true,
    message: result.created
      ? "Device registered successfully"
      : "Device already exists and was updated",
    created: result.created,
    device_id: result.device_id,
  };
}

async function getAllDevices() {
  const [rows] = await db.execute(
    `SELECT device_id, device_name, ip_address, operating_mode, pump_state, location, status, registered_at
     FROM devices
     ORDER BY registered_at DESC`
  );
  return rows;
}

async function getDeviceById(deviceId) {
  const [rows] = await db.execute(
    `SELECT device_id, device_name, ip_address, operating_mode, pump_state, location, status, registered_at
     FROM devices
     WHERE device_id = ?`,
    [deviceId]
  );
  return rows.length ? rows[0] : null;
}

async function updateDeviceMode(deviceId, mode) {
  const [rows] = await db.execute(
    "SELECT device_id, ip_address FROM devices WHERE device_id = ?",
    [deviceId]
  );
  if (rows.length === 0) {
    return null;
  }
  await db.execute("UPDATE devices SET operating_mode = ? WHERE device_id = ?", [
    mode,
    deviceId,
  ]);
  return rows[0];
}

async function updateDevice(deviceId, data) {
  const existing = await getDeviceById(deviceId);
  if (!existing) return null;
  const deviceName =
    cleanDeviceName(data.device_name) || existing.device_name;
  const ipAddress =
    data.ip_address !== undefined
      ? cleanString(data.ip_address)
      : existing.ip_address;
  const operatingMode =
    data.operating_mode === "manual"
      ? "manual"
      : data.operating_mode === "auto"
      ? "auto"
      : existing.operating_mode;
  const pumpState =
    data.pump_state === "ON"
      ? "ON"
      : data.pump_state === "OFF"
      ? "OFF"
      : existing.pump_state;
  const location =
    data.location !== undefined ? cleanString(data.location) : existing.location;
  const status =
    data.status !== undefined ? cleanString(data.status) || existing.status : existing.status;

  await db.execute(
    `UPDATE devices
     SET device_name = ?, ip_address = ?, operating_mode = ?, pump_state = ?, location = ?, status = ?
     WHERE device_id = ?`,
    [deviceName, ipAddress, operatingMode, pumpState, location, status, deviceId]
  );
  return await getDeviceById(deviceId);
}

async function deleteDevice(deviceId) {
  const [result] = await db.execute("DELETE FROM devices WHERE device_id = ?", [
    deviceId,
  ]);
  return result.affectedRows > 0;
}

const LAST_SEEN_INTERVAL_MS = 60_000;
const lastSeenUpdates = new Map();

async function touchDeviceLastSeen(deviceId, status = "active") {
  const now = Date.now();
  if (status !== "active") {
    lastSeenUpdates.delete(deviceId);
    return false;
  }

  const previous = lastSeenUpdates.get(deviceId);
  if (previous && now - previous < LAST_SEEN_INTERVAL_MS) return false;

  await db.execute("UPDATE devices SET last_seen = NOW() WHERE device_id = ?", [
    deviceId,
  ]);
  lastSeenUpdates.set(deviceId, now);
  return true;
}

module.exports = {
  ensureDevice,
  recordDevice,
  getAllDevices,
  getDeviceById,
  updateDeviceMode,
  updateDevice,
  deleteDevice,
  touchDeviceLastSeen,
};
