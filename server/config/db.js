const mysql = require("mysql2/promise");
require("dotenv").config();

const connectionLimit = parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 20;
const maxIdle = parseInt(process.env.DB_MAX_IDLE, 10) || 10;
const queueLimit = parseInt(process.env.DB_QUEUE_LIMIT, 10) || 200;

// =====================================================================
// Optimized MySQL Connection Pool
// Reused across all requests — never create a connection per API call
// =====================================================================
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "brito_school",
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  waitForConnections: true,
  connectionLimit,
  maxIdle,
  idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 60000,
  queueLimit,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 10000,
  charset: "utf8mb4",
});

pool.on("connection", (connection) => {
  connection.on("error", (err) => {
    console.error("MySQL connection error:", err.code || err.message);
  });
});

module.exports = pool;
