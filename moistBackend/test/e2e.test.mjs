import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const db = require("../config/db");
const app = require("../app");

describe("API e2e", () => {
  beforeEach(() => {
    db.execute = vi.fn();
  });

  it("GET / returns server status", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ON");
  });

  it("device and soil flow: ingest telemetry, read latest, readings and alerts", async () => {
    db.execute
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 21 }])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 7 }]);

    const ingest = await request(app).post("/soil/status").send({
      device_id: "esp32-e2e",
      moisture: 18.5,
      temperature: 27.0,
      mode: "standard",
    });
    expect(ingest.status).toBe(201);
    expect(ingest.body.autoRegistered).toBe(true);
    expect(ingest.body.alertCreated).toBe(true);

    db.execute.mockResolvedValueOnce([[{
      id: 21,
      device_id: "esp32-e2e",
      device_name: "ESP32-esp32-e2e",
      moisture: 18.5,
      temperature: 27.0,
      mode: "standard",
      created_at: "2026-01-01T00:00:00Z",
    }]]);
    const latest = await request(app).get("/soil/latest");
    expect(latest.status).toBe(200);
    expect(latest.body.success).toBe(true);
    expect(latest.body.data[0].device_id).toBe("esp32-e2e");

    db.execute.mockResolvedValueOnce([[{
      id: 21,
      device_id: "esp32-e2e",
      moisture: 18.5,
      temperature: 27.0,
      mode: "standard",
      created_at: "2026-01-01T00:00:00Z",
    }]]);
    const readings = await request(app).get("/soil/readings/esp32-e2e");
    expect(readings.status).toBe(200);
    expect(readings.body.success).toBe(true);
    expect(readings.body.device_id).toBe("esp32-e2e");
    expect(readings.body.data.length).toBe(1);

    db.execute.mockResolvedValueOnce([[{
      id: 7,
      device_id: "esp32-e2e",
      device_name: "ESP32-esp32-e2e",
      moisture_level: 18.5,
      alert_message: "Soil moisture critically low - watering recommended",
      created_at: "2026-01-01T00:00:00Z",
    }]]);
    const alerts = await request(app).get("/soil/alerts");
    expect(alerts.status).toBe(200);
    expect(alerts.body.success).toBe(true);
    expect(alerts.body.data[0].device_id).toBe("esp32-e2e");
  });

  it("PUT /device/status updates mode for known device", async () => {
    db.execute
      .mockResolvedValueOnce([[{ device_id: "esp32-e2e", ip_address: null }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).put("/device/status").send({
      device_id: "esp32-e2e",
      mode: "manual",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.mode).toBe("manual");
  });
});