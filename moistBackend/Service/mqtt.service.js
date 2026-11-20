const mqtt = require("mqtt");
const db = require("../config/db");
const deviceService = require("./device.service");
const soilService = require("./soilService.service");
const realtime = require("./realtime.service");
const { getSnapshot } = require("./snapshot.service");

const TOPIC_PREFIX = (process.env.MQTT_TOPIC_PREFIX || "devices").replace(/^\/+|\/+$/g, "");
const CLIENT_ID = process.env.MQTT_CLIENT_ID || `agrisense-backend-${process.pid}`;
const MQTT_URL =
  process.env.MQTT_URL ||
  `mqtt://${process.env.MQTT_HOST || "broker.emqx.io"}:${process.env.MQTT_PORT || "1883"}`;

const options = {
  clientId: CLIENT_ID,
  clean: true,
  keepalive: 60,
  connectTimeout: 10000,
  reconnectPeriod: 3000,
};

if (process.env.MQTT_USER) options.username = process.env.MQTT_USER;
if (process.env.MQTT_PASS) options.password = process.env.MQTT_PASS;

let client = null;
let started = false;
const pendingCommands = new Map();
const offlineCommands = new Map();

function topic(deviceId, suffix) {
  return `${TOPIC_PREFIX}/${deviceId}/${suffix}`;
}

function commandId() {
  return `cmd-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function parsePayload(message) {
  try {
    const value = JSON.parse(message.toString());
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

function normalizePump(payload) {
  if (payload.pump_state || payload.pumpState) {
    return String(payload.pump_state || payload.pumpState).toUpperCase();
  }
  if (typeof payload.pumpOn === "boolean") return payload.pumpOn ? "ON" : "OFF";
  if (typeof payload.pump === "boolean") return payload.pump ? "ON" : "OFF";
  return null;
}

function publish(deviceId, suffix, payload, qos = 1, retain = false) {
  if (!client || !client.connected) return false;
  client.publish(topic(deviceId, suffix), JSON.stringify(payload), { qos, retain });
  return true;
}

async function publishConfig(deviceId) {
  try {
    const snapshot = await getSnapshot(deviceId);
    if (!snapshot) return;
    publish(
      deviceId,
      "config",
      {
        mode: snapshot.mode,
        pumpState: snapshot.pumpStatus,
        settings: snapshot.settings,
      },
      1,
      true,
    );
  } catch (error) {
    console.error("MQTT config publish failed:", error.message);
  }
}

async function handleTelemetry(deviceId, payload) {
  const moisture = payload.soilMoisture ?? payload.moisture ?? payload.soil_moisture;
  if (moisture === undefined || moisture === null) return;

  const temperature = payload.airTemperature ?? payload.temperature ?? payload.air_temp ?? 0;
  const pumpState = normalizePump(payload);

  await soilService.recordSoilReading({
    device_id: deviceId,
    device_name: payload.deviceName || payload.device_name,
    moisture,
    temperature,
    mode: payload.mode || "standard",
    tank_level: payload.tankLevel ?? payload.tank_level,
    air_humidity: payload.airHumidity ?? payload.air_humidity,
    signal_strength: payload.signalStrength ?? payload.signal_strength,
    sensor_valid: payload.sensorValid ?? payload.sensor_valid,
    pump_state: pumpState,
    firmware_version: payload.firmwareVersion || payload.firmware_version,
    status: "active",
  });

  publish(deviceId, "status", { online: true, reason: "telemetry" }, 1, true);
  realtime.publishEvent(deviceId, "telemetry", {
    deviceId,
    moisture: Number(moisture),
    temperature: Number(temperature),
    tankLevel: payload.tankLevel ?? payload.tank_level ?? null,
    pumpState,
    at: Date.now(),
  });
}

async function handleStatus(deviceId, payload) {
  const online = payload.online === true || payload.online === "true" || payload.status === "online";
  const status = online ? "active" : "inactive";

  try {
    await deviceService.ensureDevice({
      device_id: deviceId,
      device_name: payload.deviceName || payload.device_name,
      status,
    });
    if (online) {
      await db.execute("UPDATE devices SET last_seen = NOW() WHERE device_id = ?", [deviceId]);
    }
  } catch (error) {
    console.error("MQTT status persist failed:", error.message);
  }

  realtime.publishEvent(deviceId, "status", {
    deviceId,
    online,
    reason: payload.reason || (online ? "connect" : "lwt"),
    ip: payload.ip || null,
    at: Date.now(),
  });

  if (online) await publishConfig(deviceId);
}

async function handleAck(deviceId, payload) {
  const id = String(payload.cmdId || payload.commandId || payload.id || "");
  const state = String(payload.status || payload.state || "").toUpperCase();
  const ok = ["APPLIED", "OK", "ACKNOWLEDGED", "SUCCESS"].includes(state) || payload.ok === true;
  const pending = pendingCommands.get(id);

  if (pending && ok && pending.action === "relay") {
    try {
      await deviceService.updateDevice(deviceId, { pump_state: pending.state });
    } catch (error) {
      console.error("MQTT ack persist failed:", error.message);
    }
  }
  if (pending && ok && pending.action === "mode") {
    try {
      await deviceService.updateDevice(deviceId, {
        operating_mode: String(pending.mode || "").toLowerCase(),
      });
    } catch (error) {
      console.error("MQTT mode ack persist failed:", error.message);
    }
  }
  if (pending) pendingCommands.delete(id);

  realtime.publishEvent(deviceId, "ack", {
    deviceId,
    cmdId: id,
    ok,
    state: payload.state || payload.pumpState || pending?.state || null,
    message: payload.message || "",
    at: Date.now(),
  });
}

async function handleMessage(topicName, message) {
  const parts = topicName.split("/");
  if (parts.length !== 3 || parts[0] !== TOPIC_PREFIX) return;
  const deviceId = decodeURIComponent(parts[1]);
  const suffix = parts[2];
  const payload = parsePayload(message);

  try {
    if (suffix === "telemetry") await handleTelemetry(deviceId, payload);
    else if (suffix === "status") await handleStatus(deviceId, payload);
    else if (suffix === "ack") await handleAck(deviceId, payload);
  } catch (error) {
    console.error(`MQTT ${suffix} handling failed:`, error.message);
  }
}

function flushOfflineCommands() {
  for (const [id, queued] of offlineCommands) {
    if (publish(queued.deviceId, "cmd", queued.payload, 1, false)) {
      offlineCommands.delete(id);
    }
  }
}

function initMqtt() {
  if (client) return client;
  started = true;

  client = mqtt.connect(MQTT_URL, options);

  client.on("connect", () => {
    console.log("MQTT connected:", MQTT_URL);
    client.subscribe(
      [
        `${TOPIC_PREFIX}/+/telemetry`,
        `${TOPIC_PREFIX}/+/status`,
        `${TOPIC_PREFIX}/+/ack`,
      ],
      { qos: 1 },
      (error) => {
        if (error) console.error("MQTT subscribe failed:", error.message);
      },
    );
    flushOfflineCommands();
  });

  client.on("reconnect", () => console.log("MQTT reconnecting..."));
  client.on("offline", () => console.log("MQTT offline"));
  client.on("error", (error) => console.error("MQTT error:", error.message));
  client.on("message", (topicName, message) => {
    void handleMessage(topicName, message);
  });

  return client;
}

async function publishCommand(deviceId, command) {
  if (!started) initMqtt();
  const id = command.cmdId || commandId();
  const payload = {
    cmdId: id,
    action: command.action || "relay",
    state: command.state || null,
    mode: command.mode || null,
    at: Date.now(),
  };

  pendingCommands.set(id, {
    deviceId,
    action: payload.action,
    state: payload.state,
    mode: payload.mode,
  });

  realtime.publishEvent(deviceId, "command", {
    deviceId,
    cmdId: id,
    action: payload.action,
    state: payload.state,
    at: payload.at,
  });

  const sent = publish(deviceId, "cmd", payload, 1, false);
  if (!sent) {
    offlineCommands.set(id, { deviceId, payload });
  }
  return id;
}

function close() {
  if (!client) return;
  client.end(true);
  client = null;
  started = false;
  pendingCommands.clear();
  offlineCommands.clear();
}

module.exports = {
  initMqtt,
  publishCommand,
  publishConfig,
  close,
  isConnected: () => Boolean(client && client.connected),
};
