```markdown
# 🌱 ESP32 IoT Soil Moisture Monitoring System (End-to-End)

A production-ready, multi-node IoT environmental monitoring solution built with **Arduino IDE (ESP32)** for edge sensing, an **Express.js modular backend server** for API routing and business logic, and a **MySQL relational database** for time-series telemetry storage and automated alert tracking.

---

## 🏗️ System Architecture & Data Flow

```mermaid
graph TD
    subgraph ESP32 Edge Nodes
        A1[ESP32 Node 1 (MAC ID)] -->|HTTP POST /soil/status| B[Express.js Backend API]
        A2[ESP32 Node 2 (MAC ID)] -->|HTTP POST /soil/status| B
    end

    subgraph Backend Logic Tier (moistBackend)
        B --> C[Controllers: Request Validation]
        C --> D[Services: Business & Alert Logic]
        D -->|Moisture < 30%?| E[Trigger Low-Moisture Alert]
    end

    subgraph MySQL Database Tier
        D -->|INSERT Reading| F[(soil_readings table)]
        E -->|INSERT Alert| G[(soil_alerts table)]
        B -.->|Device Registry| H[(devices table)]
    end

```

---

## 🛠️ Tech Stack & Requirements

* **Hardware:** ESP32 Development Board, Capacitive/Resistive Soil Moisture Sensor, Temperature Sensor (optional/integrated).
* **Firmware IDE:** Arduino IDE (v2.x) with libraries: `WiFi`, `HTTPClient`, `ArduinoJson`.
* **Backend Runtime:** Node.js (v18+ recommended) & Express.js.
* **Database:** MySQL Server (v8.0+).

---

## 📂 Project Structure (`moistBackend`)

```text
moistBackend/
├── config/
│   └── db.js                        # MySQL connection pool configuration (promise-based)
├── controllers/
│   └── soil.controller.js           # HTTP request parsing, validation, and response handling
├── routes/
│   └── soil.route.js                # API endpoint routing definitions (/soil/status)
├── services/
│   └── soil.service.js              # Database execution, threshold calculations, and alert logging
├── .env                             # Environment configuration (Port, Database Credentials)
├── package.json                     # Project metadata and dependencies
└── server.js                        # Main application entry point & middleware setup

```

---

## 🗄️ Database Architecture (`soil_monitoring_db`)

The database is normalized across three relational tables:

### 1. `devices` (Hardware Registry Table)

Tracks registered ESP32 nodes using their permanent hardware MAC address.

```sql
CREATE TABLE devices (
  device_id VARCHAR(30) PRIMARY KEY,       -- Factory MAC Address (e.g., 24:0A:C4:...)
  device_name VARCHAR(100) NOT NULL,       -- Human-readable name (e.g., "Greenhouse Sector A")
  location VARCHAR(100),                   -- Physical location descriptor
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

```

### 2. `soil_readings` (Telemetry Logs Table)

Stores time-series environmental data sent by active nodes during regular polling intervals.

```sql
CREATE TABLE soil_readings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id VARCHAR(30) NOT NULL,
  moisture FLOAT NOT NULL,
  temperature FLOAT NOT NULL,
  mode VARCHAR(50) DEFAULT 'standard',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

```

### 3. `soil_alerts` (Warning Event Table)

Logs stress events whenever sensor readings drop below the critical moisture threshold.

```sql
CREATE TABLE soil_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id VARCHAR(30) NOT NULL,
  moisture_level FLOAT NOT NULL,
  alert_message VARCHAR(255) DEFAULT 'Soil moisture critically low - watering required',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description | Payload / Query |
| --- | --- | --- | --- |
| **POST** | `/soil/status` | Receives telemetry from ESP32, records reading, and logs alerts if dry. | `{ "device_id": "...", "moisture": 25.4, "temperature": 24.1, "mode": "eco" }` |
| **GET** | `/soil/latest` | Fetches the latest live reading for all active nodes. | None |
| **GET** | `/soil/readings/:device_id` | Retrieves historical time-series logs for a specific node. | Query: `?limit=50` |
| **GET** | `/soil/alerts` | Fetches recent low-moisture warnings across all devices. | None |

---

## 🚀 Step-by-Step Installation & Deployment

### Step 1: Database Setup

Run the following SQL commands in your MySQL client to build the schema:

```sql
CREATE DATABASE soil_monitoring_db;
USE soil_monitoring_db;
-- Execute the CREATE TABLE scripts for devices, soil_readings, and soil_alerts provided above.

```

### Step 2: Backend Installation (`moistBackend`)

1. Clone or initialize your backend folder:
```bash
mkdir moistBackend && cd moistBackend
npm init -y
npm install express mysql2 dotenv

```


2. Create the folder hierarchy (`config`, `controllers`, `routes`, `services`) and paste the respective source files.
3. Create a `.env` file in the root directory:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=soil_monitoring_db

```


4. Start the server:
```bash
node server.js

```



### Step 3: ESP32 Firmware Setup

1. Open **Arduino IDE** and ensure the ESP32 board package is installed.
2. Install the **ArduinoJson** library via the Library Manager.
3. Write your sketch using `WiFi.macAddress()` to dynamically assign the device ID, and configure your `HTTPClient` POST loop pointing to `http://<YOUR_SERVER_IP>:3000/soil/status`.
4. Compile and flash the sketch to your hardware.

```

<ElicitationsGroup message="Would you like to build out the frontend dashboard or add authentication next?">
  <Elicitation label="Create frontend dashboard HTML/JS" query="Show me how to build a simple HTML and JavaScript dashboard to fetch and display the latest soil readings and alerts."/>
  <Elicitation label="Add API key authentication" query="How do I secure these Express endpoints with a custom header token so only authorized ESP32 devices can post data?"/>
</ElicitationsGroup>

```