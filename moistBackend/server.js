const app = require("./app");
const { testConnection } = require("./config/db");
const { ensureSchema } = require("./Service/schema.service");
const realtime = require("./Service/realtime.service");
const mqttService = require("./Service/mqtt.service");

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const reachable = await testConnection();
  if (reachable) await ensureSchema();
  mqttService.initMqtt();

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log("Server is running on port", PORT);
  });

  const shutdown = () => {
    realtime.closeAll();
    mqttService.close();
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer();
