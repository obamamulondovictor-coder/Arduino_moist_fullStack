const deviceService = require("../Service/device.service");
const mqttService = require("../Service/mqtt.service");
const realtime = require("../Service/realtime.service");


async function recordDeviceDetails(req, res) {
  try {
    const data = req.body || {};
    if (!data.device_id) {
      return res.status(400).json({
        success: false,
        message: "device_id is required",
      });
    }
    const result = await deviceService.recordDevice(data);
    return res.status(result.created ? 201 : 200).json(result);
  } catch (error) {
    console.error("recordDeviceDetails error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to register device",
    });
  }
}

async function getDevices(req, res) {
  try {
    const devices = await deviceService.getAllDevices();
    return res.status(200).json({ success: true, data: devices });
  } catch (error) {
    console.error("getDevices error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch devices",
    });
  }
}

async function getDevice(req, res) {
  try {
    const deviceId = req.params.device_id;
    const device = await deviceService.getDeviceById(deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }
    return res.status(200).json({ success: true, data: device });
  } catch (error) {
    console.error("getDevice error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch device",
    });
  }
}

async function updateDevice(req, res) {
  try {
    const deviceId = req.params.device_id;
    const updated = await deviceService.updateDevice(deviceId, req.body || {});
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("updateDevice error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update device",
    });
  }
}

async function deleteDevice(req, res) {
  try {
    const deviceId = req.params.device_id;
    const deleted = await deviceService.deleteDevice(deviceId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }
    return res.status(200).json({ success: true, message: "Device deleted" });
  } catch (error) {
    console.error("deleteDevice error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete device",
    });
  }
}

async function changeDeviceMode(req, res) {
  try {
    const data = req.body || {};
    const deviceId = data.device_id ? String(data.device_id).trim() : "";
    const mode = data.mode ? String(data.mode).trim() : "";

    if (!deviceId || !mode) {
      return res.status(400).json({
        success: false,
        message: "device_id and mode are required",
      });
    }
    if (mode !== "auto" && mode !== "manual") {
      return res.status(400).json({
        success: false,
        message: "mode must be auto or manual",
      });
    }

    const device = await deviceService.updateDeviceMode(deviceId, mode);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    let deviceNotified = false;
    if (device.ip_address) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(`http://${device.ip_address}/device/mode`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        deviceNotified = response.ok;
      } catch (_error) {
        deviceNotified = false;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Device mode updated",
      device_id: deviceId,
      mode,
      deviceNotified,
    });
  } catch (error) {
    console.error("changeDeviceMode error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to change device mode",
    });
  }
}

function streamDevice(req, res) {
  return realtime.subscribe(
    req.params.device_id,
    res,
    req.headers["last-event-id"],
  );
}

async function setDeviceStatus(req, res) {
  try {
    const deviceId = String(req.params.device_id || "").trim();
    const body = req.body || {};
    const rawState = body.state ?? body.pump ?? body.pump_state ?? body.pumpState;
    const state = rawState === undefined ? "" : String(rawState).trim().toUpperCase();
    const mode = body.mode ? String(body.mode).trim().toUpperCase() : "";

    if (!deviceId) {
      return res.status(400).json({ success: false, message: "device_id is required" });
    }
    if (state !== "ON" && state !== "OFF" && mode !== "AUTO" && mode !== "MANUAL") {
      return res.status(400).json({
        success: false,
        message: "Provide state as ON/OFF or mode as AUTO/MANUAL",
      });
    }

    const device = await deviceService.getDeviceById(deviceId);
    if (!device) {
      return res.status(404).json({ success: false, message: "Device not found" });
    }

    const command = state
      ? { action: "relay", state }
      : { action: "mode", mode };
    const cmdId = await mqttService.publishCommand(deviceId, command);

    return res.status(202).json({
      success: true,
      message: "Command queued",
      cmdId,
      device_id: deviceId,
      ...command,
    });
  } catch (error) {
    console.error("setDeviceStatus error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to queue device command",
    });
  }
}

module.exports = {
  recordDeviceDetails,
  getDevices,
  getDevice,
  updateDevice,
  deleteDevice,
  changeDeviceMode,
  streamDevice,
  setDeviceStatus,
};
