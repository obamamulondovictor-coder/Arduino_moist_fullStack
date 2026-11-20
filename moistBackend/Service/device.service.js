const db = require("../config/db");

function cleanString(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  if (!str) return null;
  return str;
}

async function ensureDevice(data) {
  const deviceId = cleanString(data.device_id);
  if (!deviceId) {
    const error = new Error("device_id is required");
    error.statusCode = 400;
    throw error;
  }

  const [rows] = await db.execute("SELECT * FROM devices WHERE device_id = ?", [
    deviceId,
  ]);

  const deviceName = cleanString(data.device_name) || `ESP32-${deviceId}`;
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
    return { created: true, device_id: deviceId };
  }

  const existing = rows[0];
  await db.execute(
    `UPDATE devices
     SET device_name = ?, ip_address = ?, operating_mode = ?, pump_state = ?, location = ?, status = ?
     WHERE device_id = ?`,
    [
      cleanString(data.device_name) || existing.device_name || deviceName,
      ipAddress !== null ? ipAddress : existing.ip_address,
      data.operating_mode ? operatingMode : existing.operating_mode || "auto",
      data.pump_state ? pumpState : existing.pump_state || "OFF",
      location !== null ? location : existing.location,
      data.status ? status : existing.status || "active",
      deviceId,
    ]
  );
  return { created: false, device_id: deviceId };
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
    cleanString(data.device_name) || existing.device_name;
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

module.exports = {
  ensureDevice,
  recordDevice,
  getAllDevices,
  getDeviceById,
  updateDeviceMode,
  updateDevice,
  deleteDevice,
};
