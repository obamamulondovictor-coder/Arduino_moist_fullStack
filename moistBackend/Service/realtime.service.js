const clientsByDevice = new Map();
let heartbeatTimer = null;

function writeEvent(res, event, payload) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function subscribe(deviceId, res) {
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
  res.write("retry: 3000\n\n");
  writeEvent(res, "ready", { deviceId, at: Date.now() });

  if (!clientsByDevice.has(deviceId)) clientsByDevice.set(deviceId, new Set());
  const clients = clientsByDevice.get(deviceId);
  clients.add(res);

  if (!heartbeatTimer) {
    heartbeatTimer = setInterval(() => {
      for (const group of clientsByDevice.values()) {
        for (const client of group) client.write(": keep-alive\n\n");
      }
    }, 20000);
    heartbeatTimer.unref?.();
  }

  const remove = () => {
    clients.delete(res);
    res.end();
    if (clients.size === 0) clientsByDevice.delete(deviceId);
  };

  res.on("close", remove);
  res.on("error", remove);
  return remove;
}

function publish(deviceId, payload) {
  const clients = clientsByDevice.get(deviceId);
  if (!clients) return 0;
  let sent = 0;
  for (const client of clients) {
    try {
      writeEvent(client, "update", payload);
      sent += 1;
    } catch {
      clients.delete(client);
    }
  }
  return sent;
}

function closeAll() {
  for (const group of clientsByDevice.values()) {
    for (const client of group) {
      client.end();
    }
  }
  clientsByDevice.clear();
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = null;
}

module.exports = { subscribe, publish, closeAll };
