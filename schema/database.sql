CREATE TABLE devices (
  device_id VARCHAR(30) PRIMARY KEY,       -- Uses the MAC address as the unique primary key
  device_name VARCHAR(100) NOT NULL,       -- e.g., "Greenhouse Sector A"
  location VARCHAR(100),                   -- e.g., "Block 2, Field 3"
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




CREATE TABLE soil_readings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id VARCHAR(30) NOT NULL,
  moisture FLOAT NOT NULL,
  temperature FLOAT NOT NULL,
  mode VARCHAR(50) DEFAULT 'standard',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);



CREATE TABLE soil_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id VARCHAR(30) NOT NULL,
  moisture_level FLOAT NOT NULL,
  alert_message VARCHAR(255) DEFAULT 'Soil moisture critically low - watering recommended',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);