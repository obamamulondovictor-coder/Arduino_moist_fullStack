const deviceService = require("../Service/device.service");

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

module.exports = {
  recordDeviceDetails,
  getDevices,
  getDevice,
  updateDevice,
  deleteDevice,
  changeDeviceMode,
};
