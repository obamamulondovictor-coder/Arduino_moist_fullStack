import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const db = require("../../config/db");
const app = require("../../app");

describe("POST /device/register", () => {
  beforeEach(() => {
    db.execute = vi.fn();
  });

  it("registers a new device", async () => {
    db.execute
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 1, affectedRows: 1 }]);

    const res = await request(app).post("/device/register").send({
      device_id: "esp32-100",
      device_name: "Field Sensor",
      ip_address: "192.168.1.100",
      location: "Field A",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.created).toBe(true);
    expect(res.body.device_id).toBe("esp32-100");
  });

  it("updates existing device on re-register", async () => {
    db.execute
      .mockResolvedValueOnce([[{
        device_id: "esp32-100",
        device_name: "Old",
        ip_address: null,
        operating_mode: "auto",
        pump_state: "OFF",
        location: null,
        status: "active",
      }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).post("/device/register").send({
      device_id: "esp32-100",
      device_name: "Updated Sensor",
      ip_address: "192.168.1.101",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.created).toBe(false);
  });

  it("returns 400 when device_id is missing", async () => {
    const res = await request(app).post("/device/register").send({
      device_name: "No Id",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /device", () => {
  beforeEach(() => {
    db.execute = vi.fn();
  });

  it("returns device list", async () => {
    db.execute.mockResolvedValueOnce([[{
      device_id: "esp32-1",
      device_name: "Sensor 1",
      ip_address: null,
      operating_mode: "auto",
      pump_state: "OFF",
      location: null,
      status: "active",
      registered_at: "2026-01-01",
    }]]);

    const res = await request(app).get("/device");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].device_id).toBe("esp32-1");
  });
});