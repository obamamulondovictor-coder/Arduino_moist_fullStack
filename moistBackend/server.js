const app = require("./app");
const { testConnection } = require("./config/db");

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  await testConnection();
  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server is running on port", PORT);
  });
}

startServer();
