const path = require("path");
const dotenv = require("dotenv");

// dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
// dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config()

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env.DB_HOST || "localhost",
  user: process.env.MYSQL_USER || process.env.DB_USER || "root",
  password:
    process.env.MYSQL_PASS ??
    process.env.MYSQL_PASSWORD ??
    process.env.DB_PASSWORD ??
    "",
  database:
    process.env.MYSQL_DATABASE ||
    process.env.DB_NAME ||
    "soilSystemDB",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return false;
  }
}

module.exports = pool;
module.exports.testConnection = testConnection;
