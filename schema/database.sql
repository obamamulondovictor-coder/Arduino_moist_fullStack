CREATE DATABASE IF NOT EXISTS soilSystemDB;
USE soilSystemDB;

CREATE TABLE IF NOT EXISTS devices (
  device_id VARCHAR(30) PRIMARY KEY,
  device_name VARCHAR(100) NOT NULL,
  ip_address VARCHAR(50) DEFAULT NULL,
  operating_mode ENUM('auto', 'manual') DEFAULT 'auto',
  pump_state ENUM('OFF', 'ON') DEFAULT 'OFF',
  location VARCHAR(100) DEFAULT NULL,
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  firmware_version VARCHAR(50) DEFAULT NULL,
  last_seen DATETIME DEFAULT NULL,
  cooldown_until DATETIME DEFAULT NULL,
  fault VARCHAR(50) DEFAULT NULL,
  fault_at DATETIME DEFAULT NULL,
  control_reason VARCHAR(255) DEFAULT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS soil_readings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id VARCHAR(30) NOT NULL,
  moisture FLOAT NOT NULL,
  temperature FLOAT NOT NULL,
  mode VARCHAR(50) DEFAULT 'standard',
  tank_level FLOAT DEFAULT NULL,
  air_humidity FLOAT DEFAULT NULL,
  signal_strength FLOAT DEFAULT NULL,
  sensor_valid TINYINT(1) NOT NULL DEFAULT 1,
  pump_state VARCHAR(10) DEFAULT NULL,
  pump_started_at DATETIME DEFAULT NULL,
  control_reason VARCHAR(255) DEFAULT NULL,
  firmware_version VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS soil_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id VARCHAR(30) NOT NULL,
  moisture_level FLOAT NOT NULL,
  alert_message VARCHAR(255) DEFAULT 'Soil moisture critically low - watering recommended',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS irrigation_settings (
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
);
