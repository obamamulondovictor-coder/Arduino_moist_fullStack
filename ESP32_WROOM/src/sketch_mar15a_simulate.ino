#if defined(ESP8266)
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
static const int RELAY_PIN = 5;
static const int STATUS_LED_PIN = 4;
static const int SOIL_SENSOR_PIN = A0;
static const int WATER_SENSOR_PIN = -1;
#else
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
static const int RELAY_PIN = 26;
static const int STATUS_LED_PIN = 25;
static const int SOIL_SENSOR_PIN = 34;
static const int WATER_SENSOR_PIN = 35;
#endif

#include <ArduinoJson.h>
#include <AsyncMqttClient.h>
#include <math.h>
#include <string.h>

#ifndef WIFI_SSID
#define WIFI_SSID "EdNEt"
#endif
#ifndef WIFI_PASSWORD
#define WIFI_PASSWORD "Huawei@123"
#endif
#ifndef API_BASE_URL
#define API_BASE_URL "https://somewhat-territory-baths-farm.trycloudflare.com"
#endif
#ifndef AGRI_DEVICE_ID
#define AGRI_DEVICE_ID "irrigation-01"
#endif
#ifndef AGRI_DEVICE_NAME
#define AGRI_DEVICE_NAME "Irrigation Field Node"
#endif
#ifndef DEVICE_API_KEY
#define DEVICE_API_KEY ""
#endif
#ifndef FIRMWARE_VERSION
#define FIRMWARE_VERSION "mqtt-1.0.0"
#endif
#ifndef MQTT_HOST
#define MQTT_HOST "broker.emqx.io"
#endif
#ifndef MQTT_PORT
#define MQTT_PORT 1883
#endif
#ifndef MQTT_USER
#define MQTT_USER ""
#endif
#ifndef MQTT_PASS
#define MQTT_PASS ""
#endif
#ifndef MQTT_TOPIC_PREFIX
#define MQTT_TOPIC_PREFIX "devices"
#endif
#ifndef MQTT_KEEPALIVE
#define MQTT_KEEPALIVE 60
#endif

#define API_TIMEOUT_MS 5000
#define API_CONNECT_TIMEOUT_MS 5000
#define WIFI_RETRY_MS 5000UL
#define MQTT_RETRY_MS 5000UL
#define OFFLINE_AFTER_MS 45000UL
#define CONFIG_REFRESH_MS 60000UL
#define STATUS_INTERVAL_MS 5000UL
#define REGISTER_RETRY_MS 5000UL
#define MAX_HANDLED_COMMANDS 32
#define RELAY_OUTPUT_ENABLED 1
#define RELAY_ACTIVE_LOW 1
#define STATUS_LED_ENABLED 1
#define STATUS_LED_ACTIVE_HIGH 1
#define FORCE_SENSOR_INVALID 0
#ifndef SOIL_CALIBRATED
#define SOIL_CALIBRATED 1
#endif
#ifndef TANK_CALIBRATED
#define TANK_CALIBRATED 1
#endif
#ifndef SOIL_RAW_DRY
#define SOIL_RAW_DRY 3000
#endif
#ifndef SOIL_RAW_WET
#define SOIL_RAW_WET 1200
#endif
#ifndef TANK_RAW_EMPTY
#define TANK_RAW_EMPTY 300
#endif
#ifndef TANK_RAW_FULL
#define TANK_RAW_FULL 2800
#endif
#ifndef SENSOR_SAMPLE_COUNT
#define SENSOR_SAMPLE_COUNT 8
#endif
#ifndef SENSOR_VALID_MARGIN
#define SENSOR_VALID_MARGIN 120
#endif

struct Settings {
  float startThreshold;
  float stopThreshold;
  unsigned long maxRuntimeSeconds;
  unsigned long cooldownSeconds;
  float minTankLevel;
  unsigned long staleAfterSeconds;
};

struct Intervals {
  unsigned long telemetryMs;
  unsigned long heartbeatMs;
};

struct ApiResponse {
  int status;
  bool ok;
  String message;
  ApiResponse() : status(0), ok(false), message("") {}
};

struct PendingCommand {
  String id;
  String type;
  String mode;
  PendingCommand() : id(""), type(""), mode("") {}
};

struct CommandResult {
  bool ok;
  String message;
  CommandResult() : ok(false), message("") {}
};

Settings settings = {30.0f, 45.0f, 90UL, 60UL, 12.0f, 30UL};
Intervals intervals = {10000UL, 15000UL};

void publishStatus(bool online, const char* reason);

AsyncMqttClient mqttClient;
String apiOrigin = "";
String mqttPrefix = "";
String telemetryTopic = "";
String statusTopic = "";
String cmdTopic = "";
String ackTopic = "";
String configTopic = "";
String currentMode = "AUTO";
String handledIds[MAX_HANDLED_COMMANDS];
int handledCount = 0;

bool useTls = false;
bool registered = false;
bool configLoaded = false;
bool wifiLogged = false;
bool mqttConnected = false;
bool commandAvailable = false;
bool sensorsValid = (FORCE_SENSOR_INVALID == 0);
bool pumpOn = false;

PendingCommand pendingCommand;
float soilMoisture = 0.0f;
float tankLevel = 0.0f;
int soilRaw = 0;
int tankRaw = 0;
bool soilValid = false;
bool tankValid = false;

unsigned long lastWiFiAttemptMs = 0;
unsigned long lastMqttAttemptMs = 0;
unsigned long lastRegisterMs = 0;
unsigned long lastBackendOkMs = 0;
unsigned long lastConfigMs = 0;
unsigned long lastStatusPublishMs = 0;
unsigned long lastTelemetryMs = 0;
unsigned long lastStatusMs = 0;
unsigned long pumpStartedMs = 0;
unsigned long cooldownUntilMs = 0;
String incomingPayload = "";

String normalizeBase(String base) {
  base.trim();
  while (base.endsWith("/")) {
    base.remove(base.length() - 1);
  }
  if (base.endsWith("/api")) {
    base.remove(base.length() - 4);
  }
  return base;
}

String apiUrl(const String& path) {
  String normalized = path;
  if (!normalized.startsWith("/")) {
    normalized = "/" + normalized;
  }
  return apiOrigin + "/api" + normalized;
}

float round1(float value) {
  return roundf(value * 10.0f) / 10.0f;
}

bool wifiConnected() {
  return WiFi.status() == WL_CONNECTED;
}

void markBackendOk() {
  lastBackendOkMs = millis();
}

bool backendOnline() {
  if (mqttConnected) return true;
  return lastBackendOkMs > 0 && (millis() - lastBackendOkMs) < OFFLINE_AFTER_MS;
}

void configureSecureClient(WiFiClientSecure& client) {
#ifdef API_TLS_ROOT_CA
  client.setCACert(API_TLS_ROOT_CA);
#else
  client.setInsecure();
#endif
}

ApiResponse finishRequest(HTTPClient& http, const char* method,
                          const String& body, DynamicJsonDocument& response) {
  ApiResponse result;
  http.setTimeout(API_TIMEOUT_MS);
  http.setConnectTimeout(API_CONNECT_TIMEOUT_MS);
  http.setReuse(false);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Accept", "application/json");
  http.addHeader("Connection", "close");

  if (String(DEVICE_API_KEY).length() > 0) {
    http.addHeader("X-Device-Key", DEVICE_API_KEY);
  }

  int status = 0;
  if (strcmp(method, "GET") == 0) {
    status = http.GET();
  } else {
    status = http.POST(body);
  }
  result.status = status;

  if (status <= 0) {
    result.message = http.errorToString(status);
    http.end();
    return result;
  }

  const String payload = http.getString();
  http.end();

  const DeserializationError error = deserializeJson(response, payload);
  if (error) {
    result.message = String("Invalid JSON: ") + error.c_str();
    return result;
  }

  const bool success = response["success"] | false;
  const char* message = response["message"] | "";
  result.ok = success && status >= 200 && status < 300;
  result.message = message;
  if (!result.ok && result.message.length() == 0) {
    result.message = String("HTTP ") + status;
  }
  return result;
}

ApiResponse apiRequest(const char* method, const String& path,
                       const String& body, DynamicJsonDocument& response) {
  ApiResponse failure;
  if (!wifiConnected()) {
    failure.message = "WiFi not connected";
    return failure;
  }

  const String url = apiUrl(path);
  if (useTls) {
    WiFiClientSecure client;
    configureSecureClient(client);
    HTTPClient http;
    if (!http.begin(client, url)) {
      failure.message = "HTTP begin failed";
      return failure;
    }
    return finishRequest(http, method, body, response);
  }

  WiFiClient client;
  HTTPClient http;
  if (!http.begin(client, url)) {
    failure.message = "HTTP begin failed";
    return failure;
  }
  return finishRequest(http, method, body, response);
}

void applySettings(JsonObject values) {
  if (values.isNull()) return;
  settings.startThreshold = values["startThreshold"] | settings.startThreshold;
  settings.stopThreshold = values["stopThreshold"] | settings.stopThreshold;
  settings.maxRuntimeSeconds = values["maxRuntimeSeconds"] | settings.maxRuntimeSeconds;
  settings.cooldownSeconds = values["cooldownSeconds"] | settings.cooldownSeconds;
  settings.minTankLevel = values["minTankLevel"] | settings.minTankLevel;
  settings.staleAfterSeconds = values["staleAfterSeconds"] | settings.staleAfterSeconds;
}

void applyMode(const String& value) {
  currentMode = (value == "MANUAL" || value == "manual") ? "MANUAL" : "AUTO";
}

void setPump(bool on, const char* reason) {
  if (pumpOn == on) return;
  pumpOn = on;

#if RELAY_OUTPUT_ENABLED
  int relayLevel = on ? (RELAY_ACTIVE_LOW ? LOW : HIGH)
                      : (RELAY_ACTIVE_LOW ? HIGH : LOW);
  digitalWrite(RELAY_PIN, relayLevel);
#if STATUS_LED_ENABLED
  int ledLevel = on ? (STATUS_LED_ACTIVE_HIGH ? HIGH : LOW)
                    : (STATUS_LED_ACTIVE_HIGH ? LOW : HIGH);
  digitalWrite(STATUS_LED_PIN, ledLevel);
#endif
#endif

  pumpStartedMs = on ? millis() : 0;
  Serial.printf("[Pump] %s (%s)\n", on ? "ON" : "OFF", reason);
  publishStatus(true, "pump-change");
}

bool alreadyHandled(const String& id) {
  for (int i = 0; i < handledCount; i++) {
    if (handledIds[i] == id) return true;
  }
  return false;
}

void rememberHandled(const String& id) {
  if (handledCount >= MAX_HANDLED_COMMANDS) {
    for (int i = 1; i < MAX_HANDLED_COMMANDS; i++) {
      handledIds[i - 1] = handledIds[i];
    }
    handledCount = MAX_HANDLED_COMMANDS - 1;
  }
  handledIds[handledCount++] = id;
}

void publishStatus(bool online, const char* reason) {
  if (!mqttConnected) return;
  DynamicJsonDocument doc(256);
  doc["online"] = online;
  doc["reason"] = reason;
  doc["ip"] = wifiConnected() ? WiFi.localIP().toString() : "";
  String body;
  serializeJson(doc, body);
  mqttClient.publish(statusTopic.c_str(), 1, true, body.c_str());
}

void publishAck(const String& commandId, bool ok, const String& message) {
  if (!mqttConnected) return;
  DynamicJsonDocument doc(384);
  doc["cmdId"] = commandId;
  doc["status"] = ok ? "applied" : "failed";
  doc["message"] = message;
  doc["pumpState"] = pumpOn ? "ON" : "OFF";
  String body;
  serializeJson(doc, body);
  mqttClient.publish(ackTopic.c_str(), 1, false, body.c_str());
}

CommandResult executeCommand(const PendingCommand& command) {
  CommandResult result;
  const unsigned long now = millis();

  if (command.type == "PUMP_ON") {
    if (!backendOnline()) {
      result.message = "Rejected: backend offline";
    } else if (!sensorsValid) {
      result.message = "Rejected: sensor invalid";
    } else if (tankLevel < settings.minTankLevel) {
      result.message = "Rejected: tank below minimum";
    } else if (now < cooldownUntilMs) {
      result.message = "Rejected: cooldown active";
    } else {
      setPump(true, "PUMP_ON command");
      result.ok = true;
      result.message = "Pump ON executed";
    }
  } else if (command.type == "PUMP_OFF") {
    setPump(false, "PUMP_OFF command");
    result.ok = true;
    result.message = "Pump OFF executed";
  } else if (command.type == "SET_MODE") {
    if (command.mode == "AUTO" || command.mode == "MANUAL") {
      applyMode(command.mode);
      result.ok = true;
      result.message = "Mode set to " + command.mode;
    } else {
      result.message = "Rejected: invalid mode";
    }
  } else {
    result.message = "Unsupported command";
  }

  return result;
}

void processPendingCommand() {
  if (!commandAvailable) return;
  commandAvailable = false;

  PendingCommand command = pendingCommand;
  CommandResult result;
  if (command.id.length() == 0 || command.type.length() == 0) {
    return;
  }

  if (!alreadyHandled(command.id)) {
    result = executeCommand(command);
    rememberHandled(command.id);
  } else {
    result.ok = true;
    result.message = "Duplicate command skipped";
  }

  Serial.printf("[Commands] %s id=%s result=%s\n", command.type.c_str(),
                command.id.c_str(), result.ok ? "ok" : "failed");
  publishAck(command.id, result.ok, result.message);
}

void onMqttConnect(bool sessionPresent) {
  mqttConnected = true;
  markBackendOk();
  Serial.printf("[MQTT] Connected sessionPresent=%d\n", sessionPresent ? 1 : 0);

  mqttClient.subscribe(cmdTopic.c_str(), 1);
  mqttClient.subscribe(configTopic.c_str(), 1);
  publishStatus(true, "connect");
}

void onMqttDisconnect(AsyncMqttClientDisconnectReason reason) {
  mqttConnected = false;
  Serial.printf("[MQTT] Disconnected reason=%d\n", static_cast<int>(reason));
}

void onMqttSubscribe(uint16_t packetId, uint8_t qos) {
  Serial.printf("[MQTT] Subscribed id=%u qos=%d\n", packetId, qos);
}

void onMqttPublish(uint16_t packetId) {
  Serial.printf("[MQTT] Published id=%u\n", packetId);
}

void handleMqttMessage(const String& topic, const String& payload) {
  if (topic == configTopic) {
    DynamicJsonDocument doc(2048);
    if (deserializeJson(doc, payload.c_str())) return;
    applyMode(String(doc["mode"] | currentMode.c_str()));
    applySettings(doc["settings"].as<JsonObject>());
    configLoaded = true;
    return;
  }

  if (topic != cmdTopic) return;

  DynamicJsonDocument doc(512);
  const DeserializationError error = deserializeJson(doc, payload.c_str());
  if (error) {
    Serial.printf("[Commands] Invalid MQTT JSON: %s\n", error.c_str());
    return;
  }

  PendingCommand command;
  command.id = String(doc["cmdId"] | doc["id"] | "");
  const String action = String(doc["action"] | "");
  const String state = String(doc["state"] | "");

  if (action == "relay" || action == "pump" || action == "PUMP_ON" || action == "PUMP_OFF") {
    const bool on = state == "ON" || state == "on" || state == "true" ||
                    action == "PUMP_ON";
    command.type = on ? "PUMP_ON" : "PUMP_OFF";
  } else if (action == "mode" || action == "SET_MODE") {
    command.type = "SET_MODE";
    command.mode = String(doc["mode"] | "");
  } else if (action == "PUMP_ON") {
    command.type = "PUMP_ON";
  } else if (action == "PUMP_OFF") {
    command.type = "PUMP_OFF";
  }

  if (command.id.length() > 0 && command.type.length() > 0) {
    pendingCommand = command;
    commandAvailable = true;
  }
}

void onMqttMessage(char* topic, char* payload,
                   AsyncMqttClientMessageProperties properties,
                   size_t len, size_t index, size_t total) {
  if (index == 0) incomingPayload = "";
  for (size_t i = 0; i < len; i++) {
    incomingPayload += static_cast<char>(payload[i]);
  }
  if (index + len < total) return;
  handleMqttMessage(String(topic), incomingPayload);
  incomingPayload = "";
}

void connectMqtt() {
  if (mqttConnected || !wifiConnected()) return;
  mqttClient.connect();
  lastMqttAttemptMs = millis();
}

bool registerDevice() {
  DynamicJsonDocument requestDoc(512);
  requestDoc["device_id"] = AGRI_DEVICE_ID;
  requestDoc["device_name"] = AGRI_DEVICE_NAME;
  requestDoc["firmware_version"] = FIRMWARE_VERSION;
  requestDoc["status"] = "active";

  String body;
  serializeJson(requestDoc, body);

  DynamicJsonDocument responseDoc(1024);
  ApiResponse response = apiRequest("POST", "/device/register", body, responseDoc);
  if (response.ok) {
    registered = true;
    markBackendOk();
    Serial.println("[Device] Registered with backend");
  } else {
    Serial.printf("[Device] Register failed: %s\n", response.message.c_str());
  }
  return response.ok;
}

bool fetchConfig() {
  DynamicJsonDocument responseDoc(4096);
  const String path = String("/soil/snapshot/") + AGRI_DEVICE_ID;
  ApiResponse response = apiRequest("GET", path, "", responseDoc);
  if (!response.ok) {
    Serial.printf("[Config] Fetch failed: %s\n", response.message.c_str());
    return false;
  }

  JsonObject data = responseDoc["data"].as<JsonObject>();
  if (data.isNull()) {
    Serial.println("[Config] Response is missing data");
    return false;
  }

  applyMode(String(data["mode"] | "AUTO"));
  applySettings(data["settings"].as<JsonObject>());
  configLoaded = true;
  markBackendOk();
  return true;
}

int readSensorAverage(int pin) {
  if (pin < 0) return -1;
  const int samples = SENSOR_SAMPLE_COUNT > 0 ? SENSOR_SAMPLE_COUNT : 1;
  uint32_t total = 0;
  for (int i = 0; i < samples; i++) {
    total += analogRead(pin);
    delayMicroseconds(200);
  }
  return static_cast<int>(total / samples);
}

float rawToPercent(int raw, int emptyRaw, int fullRaw, bool& valid) {
  valid = false;
  if (raw < 0 || emptyRaw == fullRaw) return 0.0f;

  const int low = emptyRaw < fullRaw ? emptyRaw : fullRaw;
  const int high = emptyRaw < fullRaw ? fullRaw : emptyRaw;
  if (raw < low - SENSOR_VALID_MARGIN || raw > high + SENSOR_VALID_MARGIN) {
    return 0.0f;
  }

  float percent = (static_cast<float>(raw - emptyRaw) * 100.0f) /
                  static_cast<float>(fullRaw - emptyRaw);
  if (percent < 0.0f) percent = 0.0f;
  if (percent > 100.0f) percent = 100.0f;
  valid = true;
  return percent;
}

void readSensors() {
  soilRaw = readSensorAverage(SOIL_SENSOR_PIN);
#if TANK_CALIBRATED && !defined(ESP8266)
  tankRaw = readSensorAverage(WATER_SENSOR_PIN);
#else
  tankRaw = -1;
#endif

#if SOIL_CALIBRATED
  soilMoisture = rawToPercent(soilRaw, SOIL_RAW_DRY, SOIL_RAW_WET, soilValid);
#else
  soilMoisture = 0.0f;
  soilValid = false;
#endif

#if TANK_CALIBRATED && !defined(ESP8266)
  tankLevel = rawToPercent(tankRaw, TANK_RAW_EMPTY, TANK_RAW_FULL, tankValid);
#else
  tankLevel = 0.0f;
  tankValid = false;
#endif

  sensorsValid = (FORCE_SENSOR_INVALID == 0) && soilValid && tankValid;
}

String telemetryBody() {
  DynamicJsonDocument doc(512);
  doc["deviceId"] = AGRI_DEVICE_ID;
  doc["deviceName"] = AGRI_DEVICE_NAME;
  if (soilValid) {
    doc["soilMoisture"] = round1(soilMoisture);
  } else {
    doc["soilMoisture"] = nullptr;
  }
  if (tankValid) {
    doc["tankLevel"] = round1(tankLevel);
  } else {
    doc["tankLevel"] = nullptr;
  }
  doc["sensorValid"] = sensorsValid;
  doc["signalStrength"] = wifiConnected() ? WiFi.RSSI() : 0;
  doc["pumpOn"] = pumpOn;
  doc["mode"] = currentMode;
  doc["firmwareVersion"] = FIRMWARE_VERSION;
  doc["ts"] = millis() / 1000UL;
  String body;
  serializeJson(doc, body);
  return body;
}

bool sendTelemetryMqtt() {
  if (!mqttConnected) return false;
  const String body = telemetryBody();
  mqttClient.publish(telemetryTopic.c_str(), 1, false, body.c_str());
  markBackendOk();
  return true;
}

bool sendTelemetryHttp() {
  DynamicJsonDocument doc(768);
  doc["device_id"] = AGRI_DEVICE_ID;
  doc["device_name"] = AGRI_DEVICE_NAME;
  doc["moisture"] = soilValid ? round1(soilMoisture) : 0;
  doc["temperature"] = 25.0f;
  if (tankValid) {
    doc["tank_level"] = round1(tankLevel);
  } else {
    doc["tank_level"] = nullptr;
  }
  doc["air_humidity"] = nullptr;
  doc["signal_strength"] = wifiConnected() ? WiFi.RSSI() : 0;
  doc["sensor_valid"] = sensorsValid;
  doc["pump_state"] = pumpOn ? "ON" : "OFF";
  doc["firmware_version"] = FIRMWARE_VERSION;
  doc["status"] = "active";

  String body;
  serializeJson(doc, body);

  DynamicJsonDocument responseDoc(1024);
  ApiResponse response = apiRequest("POST", "/soil/status", body, responseDoc);
  if (!response.ok) {
    Serial.printf("[Telemetry] HTTP fallback failed: %s\n", response.message.c_str());
    return false;
  }
  markBackendOk();
  return true;
}

void sendTelemetry() {
  if (!sendTelemetryMqtt()) sendTelemetryHttp();
}

void enforceSafety(unsigned long now) {
  if (!backendOnline()) {
    if (pumpOn) {
      setPump(false, "backend unreachable");
      cooldownUntilMs = now + settings.cooldownSeconds * 1000UL;
    }
    return;
  }

  if (!sensorsValid && pumpOn) {
    setPump(false, "sensor invalid");
    cooldownUntilMs = now + settings.cooldownSeconds * 1000UL;
    return;
  }

  if (tankLevel < settings.minTankLevel && pumpOn) {
    setPump(false, "tank below minimum");
    cooldownUntilMs = now + settings.cooldownSeconds * 1000UL;
  }
}

void maintainWiFi(unsigned long now) {
  if (wifiConnected()) {
    if (!wifiLogged) {
      Serial.printf("[WiFi] Connected IP=%s RSSI=%d dBm\n",
                    WiFi.localIP().toString().c_str(), WiFi.RSSI());
      wifiLogged = true;
    }
    return;
  }

  if (wifiLogged) {
    Serial.println("[WiFi] Disconnected");
    wifiLogged = false;
    mqttConnected = false;
    lastBackendOkMs = 0;
  }

  if (now - lastWiFiAttemptMs >= WIFI_RETRY_MS) {
    lastWiFiAttemptMs = now;
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.println("[WiFi] Connecting...");
  }
}

void printStatus() {
  String errors = "";
#if FORCE_SENSOR_INVALID
  errors += "forced-invalid ";
#endif
#if !SOIL_CALIBRATED
  errors += "soil-uncalibrated ";
#endif
  if (SOIL_CALIBRATED && !soilValid) errors += "soil-out-of-range ";
#if !TANK_CALIBRATED || defined(ESP8266)
  errors += "tank-unavailable ";
#else
  if (!tankValid) errors += "tank-out-of-range ";
#endif
  if (!wifiConnected()) errors += "wifi-disconnected ";
  else if (!mqttConnected) errors += "mqtt-disconnected ";

  int expectedRelayLevel = pumpOn ? (RELAY_ACTIVE_LOW ? LOW : HIGH)
                                  : (RELAY_ACTIVE_LOW ? HIGH : LOW);
  int relayLevel = digitalRead(RELAY_PIN);
#if RELAY_OUTPUT_ENABLED
  if (relayLevel != expectedRelayLevel) errors += "relay-mismatch ";
#endif
  if (errors.length() == 0) errors = "none";

  Serial.println("---------- AgriSense readings ----------");
  Serial.printf("SOIL_MOIST : %s | raw=%d | %s\n",
                soilValid ? String(soilMoisture, 1).c_str() : "--", soilRaw,
                soilValid ? "VALID" : "ERROR");
  Serial.printf("TANK_LEVEL : %s | raw=%d | %s\n",
                tankValid ? String(tankLevel, 1).c_str() : "--", tankRaw,
                tankValid ? "VALID" : "ERROR");
  Serial.printf("PUMP : %s | MODE : %s | RELAY_GPIO=%s\n",
                pumpOn ? "ON" : "OFF", currentMode.c_str(),
                relayLevel == LOW ? "LOW" : "HIGH");
  Serial.printf("WIFI : %s | MQTT : %s | ERRORS : %s\n",
                wifiConnected() ? "CONNECTED" : "DISCONNECTED",
                mqttConnected ? "CONNECTED" : "DISCONNECTED", errors.c_str());
}

void setupTopics() {
  mqttPrefix = normalizeBase(MQTT_TOPIC_PREFIX);
  mqttPrefix.replace("/", "_");
  const String root = String(mqttPrefix) + "/" + AGRI_DEVICE_ID;
  telemetryTopic = root + "/telemetry";
  statusTopic = root + "/status";
  cmdTopic = root + "/cmd";
  ackTopic = root + "/ack";
  configTopic = root + "/config";
}

void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println("\n[AgriSense] MQTT firmware boot");

  apiOrigin = normalizeBase(API_BASE_URL);
  useTls = apiOrigin.startsWith("https://");
  Serial.printf("[API] Origin: %s\n", apiOrigin.c_str());
  Serial.printf("[MQTT] %s:%d topic=%s\n", MQTT_HOST, MQTT_PORT, mqttPrefix.c_str());

  setupTopics();

#if RELAY_OUTPUT_ENABLED
  digitalWrite(RELAY_PIN, RELAY_ACTIVE_LOW ? HIGH : LOW);
  pinMode(RELAY_PIN, OUTPUT);
#if STATUS_LED_ENABLED
  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, STATUS_LED_ACTIVE_HIGH ? LOW : HIGH);
#endif
#endif

#if !defined(ESP8266)
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);
#endif
  pinMode(SOIL_SENSOR_PIN, INPUT);
#if TANK_CALIBRATED && !defined(ESP8266)
  pinMode(WATER_SENSOR_PIN, INPUT);
#endif

  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  if (strlen(MQTT_USER) > 0) mqttClient.setCredentials(MQTT_USER, MQTT_PASS);
  mqttClient.setClientId(AGRI_DEVICE_ID);
  mqttClient.setCleanSession(false);
  mqttClient.setKeepAlive(MQTT_KEEPALIVE);
  mqttClient.setWill(statusTopic.c_str(), 1, true, "{\"online\":false,\"reason\":\"lwt\"}");
  mqttClient.onConnect(onMqttConnect);
  mqttClient.onDisconnect(onMqttDisconnect);
  mqttClient.onSubscribe(onMqttSubscribe);
  mqttClient.onPublish(onMqttPublish);
  mqttClient.onMessage(onMqttMessage);

  readSensors();
  printStatus();

  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("[WiFi] Connecting...");
}

void loop() {
  const unsigned long now = millis();
  maintainWiFi(now);
  readSensors();

  if (now - lastStatusMs >= STATUS_INTERVAL_MS) {
    lastStatusMs = now;
    printStatus();
  }

  if (!wifiConnected()) {
    enforceSafety(now);
    delay(200);
    return;
  }

  if (!registered && now - lastRegisterMs >= REGISTER_RETRY_MS) {
    lastRegisterMs = now;
    registerDevice();
  }

  if (registered && (!configLoaded || now - lastConfigMs >= CONFIG_REFRESH_MS)) {
    lastConfigMs = now;
    fetchConfig();
  }

  if (!mqttConnected && now - lastMqttAttemptMs >= MQTT_RETRY_MS) {
    connectMqtt();
  }

  if (mqttConnected && now - lastStatusPublishMs >= intervals.heartbeatMs) {
    lastStatusPublishMs = now;
    publishStatus(true, "heartbeat");
  }

  if (now - lastTelemetryMs >= intervals.telemetryMs) {
    lastTelemetryMs = now;
    sendTelemetry();
  }

  processPendingCommand();
  enforceSafety(now);

  delay(50);
}
