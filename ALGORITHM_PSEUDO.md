
---

## 1. ESP32 Edge Device Telemetry Loop

```text
ALGORITHM ESP32_Sensor_Loop
INPUT: Wi-Fi credentials, Server URL, Sensor Pin
OUTPUT: HTTP POST JSON Payload

1. INITIALIZE Serial Monitor at 115200 baud
2. SETUP Pin mode for soil sensor as INPUT
3. CONNECT to Wi-Fi SSID using WiFi.begin(ssid, password)
4. WHILE WiFi.status() != WL_CONNECTED
   - WAIT 500ms
   - PRINT "."
END WHILE

5. RETRIEVE permanent hardware ID:
   - deviceId = WiFi.macAddress()

6. LOOP FOREVER:
   a. READ analog value from sensor pin:
      - rawValue = analogRead(SENSOR_PIN)
      - moisturePercentage = CONVERT_TO_PERCENTAGE(rawValue)
   b. READ temperature (optional or constant simulation)
      - temperature = READ_TEMP_SENSOR()
   
   c. CREATE JSON Document using ArduinoJson:
      - doc["device_id"] = deviceId
      - doc["moisture"] = moisturePercentage
      - doc["temperature"] = temperature
      - doc["mode"] = "standard"
   
   d. SERIALIZE JSON document to string:
      - jsonString = serializeJson(doc)

   e. INITIATE HTTP Client connection to serverName
   f. SET HTTP header "Content-Type: application/json"
   g. SEND HTTP POST request with jsonString
   
   h. IF response code > 0 THEN
      - PRINT response payload
   ELSE
      - PRINT connection error code
   END IF

   i. CLOSE HTTP connection
   j. DELAY for 10000ms (10 seconds)
END LOOP
2. Express Backend Telemetry Processing (soil.service.js)
Plaintext
ALGORITHM Process_Soil_Reading(incomingData)
INPUT: incomingData { device_id, moisture, temperature, mode }
OUTPUT: Database insertion result & potential alert log

1. EXTRACT fields from incomingData:
   - device_id, moisture, temperature, mode

2. VALIDATE inputs:
   - IF device_id is empty OR moisture is undefined OR temperature is undefined THEN
     - RETURN HTTP 400 (Bad Request: Missing required fields)
   END IF

3. EXECUTE MySQL Query to save telemetry reading:
   - query = "INSERT INTO soil_readings (device_id, moisture, temperature, mode) VALUES (?, ?, ?, ?)"
   - db.execute(query, [device_id, moisture, temperature, mode])

4. EVALUATE Threshold Rule:
   - DEFINE DRY_THRESHOLD = 30.0
   - IF moisture < DRY_THRESHOLD THEN
     a. EXECUTE MySQL Query to log alert:
        - alertQuery = "INSERT INTO soil_alerts (device_id, moisture_level) VALUES (?, ?)"
        - db.execute(alertQuery, [device_id, moisture])
     b. LOG warning event to server console:
        - PRINT "⚠️ Low moisture alert logged for device: " + device_id
   END IF

5. RETURN success response (HTTP 201 Created) to ESP32

---

<ElicitationsGroup message="Would you like to build out any additional documentation or code modules next?">
  <Elicitation label="Create frontend dashboard HTML template" query="Show me how to build a simple frontend dashboard webpage to display live charts of these soil readings."/>
  <Elicitation label="Add device auto-registration logic" query="How can I write Express service logic to automatically register unknown ESP32 MAC addresses into the devices table?"/>
</ElicitationsGroup>