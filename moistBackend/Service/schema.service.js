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

const COLUMN_TARGETS = [
  ["devices", "device_id", "VARCHAR(255) NOT NULL"],
  ["devices", "device_name", "VARCHAR(255) NOT NULL"],
  ["irrigation_settings", "device_id", "VARCHAR(255) NOT NULL"],
  ["soil_alerts", "device_id", "VARCHAR(255) NOT NULL"],
  ["soil_readings", "device_id", "VARCHAR(255) NOT NULL"],
];

const DEVICE_FOREIGN_KEYS = [
  ["irrigation_settings", "irrigation_settings_ibfk_1"],
  ["soil_alerts", "soil_alerts_ibfk_1"],
  ["soil_readings", "soil_readings_ibfk_1"],
];

const CREATE_SETTINGS = `CREATE TABLE IF NOT EXISTS irrigation_settings (
  device_id VARCHAR(255) NOT NULL,
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

async function getColumnType(table, column) {
  const [rows] = await db.execute(
    `SELECT COLUMN_TYPE FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column],
  );
  return rows[0]?.COLUMN_TYPE || null;
}

async function hasForeignKey(table, constraintName) {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS total FROM information_schema.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
        AND CONSTRAINT_NAME = ? AND CONSTRAINT_TYPE = 'FOREIGN KEY'`,
    [table, constraintName],
  );
  return Number(rows[0]?.total || 0) > 0;
}

async function widenDeviceColumns() {
  const pending = [];
  for (const [table, column, definition] of COLUMN_TARGETS) {
    if (!(await hasTable(table))) continue;
    const current = await getColumnType(table, column);
    if (current && !/^varchar\(255\)$/i.test(current)) {
      pending.push([table, column, definition]);
    }
  }
  if (pending.length === 0) return;

  const dropped = [];
  for (const [table, constraintName] of DEVICE_FOREIGN_KEYS) {
    if (await hasForeignKey(table, constraintName)) {
      await db.execute(`ALTER TABLE ${table} DROP FOREIGN KEY ${constraintName}`);
      dropped.push([table, constraintName]);
    }
  }

  try {
    for (const [table, column, definition] of pending) {
      await db.execute(`ALTER TABLE ${table} MODIFY COLUMN ${column} ${definition}`);
      console.log(`Schema widened: ${table}.${column}`);
    }
  } finally {
    for (const [table, constraintName] of dropped) {
      await db.execute(
        `ALTER TABLE ${table} ADD CONSTRAINT ${constraintName}
          FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE`,
      );
    }
  }
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

    await widenDeviceColumns();

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
