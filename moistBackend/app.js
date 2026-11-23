const express = require("express");
const cors = require("cors");

const soilRoute = require("./Routes/soildRoute.route");
const deviceRoute = require("./Routes/device.route");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Soil Moisture Server Up And Running",
    status: "ON",
  });
});

app.use("/device", deviceRoute);
app.use("/soil", soilRoute);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((error, req, res, _next) => {
  console.error("Unhandled error:", error.message);
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

module.exports = app;
