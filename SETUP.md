# ⚙️ Installation & Deployment Guide (`SETUP.md`)

This guide walks you through setting up the MySQL database, configuring the modular Express.js backend, and flashing your ESP32 microcontroller nodes.

---

## 📋 Prerequisites & Tools

* **Software:**
  * [Node.js](https://nodejs.org/) (v18 or higher)
  * [MySQL Server](https://dev.mysql.com/downloads/) (v8.0+)
  * [Arduino IDE](https://www.arduino.cc/en/software) (v2.x)
* **Arduino Libraries (Install via Library Manager):**
  * `ArduinoJson` (v7+)
  * `WiFi` (Built-in for ESP32)
  * `HTTPClient` (Built-in for ESP32)
* **Hardware:**
  * ESP32 Development Board
  * Capacitive or Resistive Soil Moisture Sensor
  * Jumper wires & breadboard

---

## 🗄️ Step 1: Database Setup

1. Open your MySQL command line client or graphical tool (e.g., MySQL Workbench, phpMyAdmin).
2. Create the database and tables by running the following SQL script:
   ```sql
   CREATE DATABASE soil_monitoring_db;
   USE soil_monitoring_db;

   -- 1. Devices Registry Table
   CREATE TABLE devices (
     device_id VARCHAR(255) PRIMARY KEY,
     device_name VARCHAR(255) NOT NULL,
     location VARCHAR(100),
     status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
     registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- 2. Telemetry Readings Table
   CREATE TABLE soil_readings (
     id INT AUTO_INCREMENT PRIMARY KEY,
     device_id VARCHAR(255) NOT NULL,
     moisture FLOAT NOT NULL,
     temperature FLOAT NOT NULL,
     mode VARCHAR(50) DEFAULT 'standard',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
   );

   -- 3. Critical Alerts Log Table
   CREATE TABLE soil_alerts (
     id INT AUTO_INCREMENT PRIMARY KEY,
     device_id VARCHAR(255) NOT NULL,
     moisture_level FLOAT NOT NULL,
     alert_message VARCHAR(255) DEFAULT 'Soil moisture critically low - watering required',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
   );
🚀 Step 2: Backend Setup (moistBackend)
Open your terminal and navigate to your backend project directory:

Bash
cd moistBackend
Install project dependencies:

Bash
npm install
Create a .env.local file in the root of moistBackend/ and configure your credentials (see .env.example):

Code snippet
PORT=5000
MYSQL_HOST=localhost
MYSQL_USER=soilSystem
MYSQL_PASS=your_mysql_password
MYSQL_DATABASE=soilSystemDB
MQTT_URL=mqtt://broker.emqx.io:1883
MQTT_TOPIC_PREFIX=devices
MQTT_USER=
MQTT_PASS=
Leave MQTT_USER and MQTT_PASS blank for the public broker. Never commit .env.local.

Start the backend server:

Bash
npm run dev
(Verify you see the server listening on port 5000 and MQTT connected.)

🌐 Step 3: Frontend Setup (moistFrontend)
From the repository root:

Bash
cd moistFrontend
npm install
Copy .env.example to .env and set the backend URL:

Code snippet
VITE_API_BASE_URL=http://localhost:5000
Start the dashboard:

Bash
npm run dev
For Vercel deployments, set VITE_API_BASE_URL in the project environment variables to the deployed backend URL (for example https://your-backend-domain.example). Never commit .env.

🔌 Step 4: ESP32 Firmware & Hardware Setup
Connect your soil moisture sensor analog output pin to an ESP32 ADC pin (e.g., GPIO 34).

Open Arduino IDE, select your specific ESP32 board type, and choose the correct COM port.

Create a new sketch, include WiFi.h, HTTPClient.h, and ArduinoJson.h.

Configure your Wi-Fi credentials and server endpoint URL:

C++
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverName = "http://<YOUR_COMPUTER_IP>:3000/soil/status";
Compile and upload the sketch. Open the Serial Monitor (115200 baud) to watch the device retrieve its MAC address, connect to Wi-Fi, and successfully post JSON payloads to your Express server.