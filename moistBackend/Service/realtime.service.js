const clientsByDevice = new Map();
const historyByDevice = new Map();
const HISTORY_LIMIT = 50;
let sequence = 0;
let heartbeatTimer = null;

function nextId() {
  sequence += 1;
  return String(sequence);
}

function frame(res, event, payload, id) {
  if (res.writableEnded || res.destroyed) return false;
  res.write(`id: ${id}\n`);
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
  return true;
}

function remember(deviceId, id, event, payload) {
  if (!historyByDevice.has(deviceId)) historyByDevice.set(deviceId, []);
  const history = historyByDevice.get(deviceId);
  history.push({ id: Number(id), event, payload, at: Date.now() });
  if (history.length > HISTORY_LIMIT) history.splice(0, history.length - HISTORY_LIMIT);
}

function subscribe(deviceId, res, lastEventId) {
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
  res.write("retry: 3000\n\n");

  if (!clientsByDevice.has(deviceId)) clientsByDevice.set(deviceId, new Set());
  const clients = clientsByDevice.get(deviceId);
  clients.add(res);

  const after = Number(lastEventId) || 0;
  const history = historyByDevice.get(deviceId) || [];
  for (const item of history) {
    if (item.id > after) frame(res, item.event, item.payload, String(item.id));
  }

  const readyId = nextId();
  frame(res, "ready", { deviceId, at: Date.now() }, readyId);

  if (!heartbeatTimer) {
    heartbeatTimer = setInterval(() => {
      for (const group of clientsByDevice.values()) {
        for (const client of group) {
          if (!client.writableEnded && !client.destroyed) client.write(": keep-alive\n\n");
        }
      }
    }, 20000);
    heartbeatTimer.unref?.();
  }

  const remove = () => {
    clients.delete(res);
    if (clients.size === 0) clientsByDevice.delete(deviceId);
  };

  res.on("close", remove);
  res.on("error", remove);
  return remove;
}

function publishEvent(deviceId, event, payload) {
  const id = nextId();
  remember(deviceId, id, event, payload);
  const clients = clientsByDevice.get(deviceId);
  if (!clients) return id;
  for (const client of clients) {
    if (!frame(client, event, payload, id)) clients.delete(client);
  }
  return id;
}

function publish(deviceId, payload) {
  return publishEvent(deviceId, "update", payload);
}

function closeAll() {
  for (const group of clientsByDevice.values()) {
    for (const client of group) client.end();
  }
  clientsByDevice.clear();
  historyByDevice.clear();
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = null;
}

module.exports = { subscribe, publish, publishEvent, closeAll };
