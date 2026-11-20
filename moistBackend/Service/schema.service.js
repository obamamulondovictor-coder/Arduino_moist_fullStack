const db = require("../config/db");

const COLUMN_ADDITIONS = {
  soil_readings: [
    ["tank_level", "FLOAT NULL"],
    ["air_humidity", "FLOAT NULL"],
    ["signal_strength", "FLOAT NULL"],
    ["sensor_valid", "TINYINT(1) NOT NULL DEFAULT 1"],
    ["pump_state", "VARCHAR(10) NULL"],
    ["pump_started_at", "DATETIME NULL"],
    ["control_reason", "VARCHAR(255) NULL"],
    ["firmware_version", "VARCHAR(50) NULL"],
  ],
  devices: [
    ["last_seen", "DATETIME NULL"],
    ["firmware_version", "VARCHAR(50) NULL"],
    ["cooldown_until", "DATETIME NULL"],
    ["fault", "VARCHAR(50) NULL"],
    ["fault_at", "DATETIME NULL"],
    ["control_reason", "VARCHAR(255) NULL"],
  ],
};

const CREATE_SETTINGS = `CREATE TABLE IF NOT EXISTS irrigation_settings (
  device_id VARCHAR(30) NOT NULL,
  start_threshold FLOAT NOT NULL DEFAULT 30,
  stop_threshold FLOAT NOT NULL DEFAULT 45,
  max_runtime_seconds INT NOT NULL DEFAULT 90,
  cooldown_seconds INT NOT NULL DEFAULT 60,
  min_tank_level FLOAT NOT NULL DEFAULT 12,
  stale_after_seconds INT NOT NULL DEFAULT 30,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (device_id),
  FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
)`;

async function hasColumn(table, column) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS total FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column],
  );
  return Number(rows[0]?.total || 0) > 0;
}

async function hasTable(table) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS total FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table],
  );
  return Number(rows[0]?.total || 0) > 0;
}

async function ensureSchema() {
  try {
    for (const [table, columns] of Object.entries(COLUMN_ADDITIONS)) {
      if (!(await hasTable(table))) continue;
      for (const [column, definition] of columns) {
        if (!(await hasColumn(table, column))) {
          await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
          console.log(`Schema upgraded: ${table}.${column}`);
        }
      }
    }

    if (await hasTable("devices")) {
      await db.execute(CREATE_SETTINGS);
      await db.execute(
        `INSERT IGNORE INTO irrigation_settings (device_id)
         SELECT device_id FROM devices`,
      );
    }
    return true;
  } catch (error) {
    console.error("Schema upgrade skipped:", error.message);
    return false;
  }
}

module.exports = { ensureSchema, COLUMN_ADDITIONS, CREATE_SETTINGS };
