import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const db = require("../../config/db");
const app = require("../../app");

describe("POST /soil/status", () => {
  beforeEach(() => {
    db.execute = vi.fn();
  });

  it("auto-registers new device and saves soil reading", async () => {
    db.execute
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 1, affectedRows: 1 }])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 10, affectedRows: 1 }]);

    const res = await request(app).post("/soil/status").send({
      device_id: "esp32-001",
      moisture: 45.5,
      temperature: 26.2,
      mode: "standard",
      device_name: "Greenhouse Sensor",
      ip_address: "192.168.1.50",
      location: "Greenhouse",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.autoRegistered).toBe(true);
    expect(res.body.alertCreated).toBe(false);
    expect(res.body.device_id).toBe("esp32-001");
    expect(db.execute).toHaveBeenCalledTimes(4);
  });

  it("saves reading for existing device and creates alert when moisture is low", async () => {
    db.execute
      .mockResolvedValueOnce([[{
        device_id: "esp32-002",
        device_name: "ESP32-esp32-002",
        ip_address: "10.0.0.2",
        operating_mode: "auto",
        pump_state: "OFF",
        location: null,
        status: "active",
      }]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 11, affectedRows: 1 }])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 5, affectedRows: 1 }]);

    const res = await request(app).post("/soil/status").send({
      device_id: "esp32-002",
      ip_address: "10.0.0.2",
      moisture: 20.0,
      temperature: 30.1,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.autoRegistered).toBe(false);
    expect(res.body.alertCreated).toBe(true);
  });

  it("skips database writes when telemetry has not changed", async () => {
    db.execute
      .mockResolvedValueOnce([[{
        device_id: "esp32-004",
        device_name: "ESP32-esp32-004",
        ip_address: "192.168.1.50",
        operating_mode: "auto",
        pump_state: "OFF",
        location: null,
        status: "active",
      }]])
      .mockResolvedValueOnce([[{
        moisture: 45.5,
        temperature: 26.2,
        tank_level: null,
        pump_state: null,
        mode: "standard",
        sensor_valid: 1,
        firmware_version: null,
      }]]);

    const res = await request(app).post("/soil/status").send({
      device_id: "esp32-004",
      ip_address: "192.168.1.50",
      moisture: 45.5,
      temperature: 26.2,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.dbWritten).toBe(false);
    expect(res.body.insertId).toBe(null);
    expect(db.execute).toHaveBeenCalledTimes(2);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app).post("/soil/status").send({
      device_id: "esp32-003",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(db.execute).not.toHaveBeenCalled();
  });
});