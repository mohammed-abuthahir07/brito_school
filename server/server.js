require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const { authLimiter, generalLimiter } = require("./admin/middleware/rateLimiter");

// Route Handlers
const adminRoutes = require("./admin/routes/adminAuthRoutes");
const adminForgetpasswordRoutes = require("./admin/routes/adminForgetpasswordRoutes");
const announcementRoutes = require("./admin/routes/announcementRoutes");
const calendarRoutes = require("./admin/routes/calendarRoutes");
const thirukkuralRoutes = require("./admin/routes/thirukkuralRoutes");
const galleryRoutes = require("./admin/routes/galleryRoutes");
const profileRoutes = require("./admin/routes/profileRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================
// Process-Level Exception & Rejection Handlers
// =====================================
process.on("unhandledRejection", (reason, promise) => {
  console.error("Critical: Unhandled Promise Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Critical: Uncaught Exception thrown:", error);
});

// =====================================
// Security & Performance Headers
// =====================================
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// =====================================
// CORS Configuration (Configurable & Backward-Compatible)
// =====================================
const corsOptions = process.env.CORS_ORIGIN
  ? { origin: process.env.CORS_ORIGIN.split(",").map((s) => s.trim()) }
  : {};
app.use(cors(corsOptions));

// =====================================
// Request Parsers with DoS Protection
// =====================================
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Static Assets with Cache-Control and ETag for high performance
const uploadsPath = path.join(__dirname, "uploads");
app.use(
  "/uploads",
  express.static(uploadsPath, {
    maxAge: "1d",
    etag: true,
  })
);

// Optional Swagger Documentation Route
app.use("/docs", express.static(path.join(__dirname, "docs")));

// =====================================
// Health Check Endpoint (Liveness, Readiness & Storage Probes)
// =====================================
app.get("/health", async (req, res) => {
  let dbStatus = "DISCONNECTED";
  let dbLatencyMs = null;
  const start = performance.now();

  try {
    const [rows] = await pool.query("SELECT 1 AS ping");
    if (rows && rows[0] && rows[0].ping === 1) {
      dbStatus = "CONNECTED";
      dbLatencyMs = parseFloat((performance.now() - start).toFixed(2));
    }
  } catch (err) {
    dbStatus = "UNREACHABLE";
    console.error("Health check database ping failure:", err.message);
  }

  const memory = process.memoryUsage();
  let diskMetrics = null;

  try {
    const stat = await fs.promises.statfs(uploadsPath);
    diskMetrics = {
      freeGb: parseFloat(((stat.bfree * stat.bsize) / (1024 ** 3)).toFixed(2)),
      totalGb: parseFloat(((stat.blocks * stat.bsize) / (1024 ** 3)).toFixed(2)),
      usagePercent: parseFloat((((stat.blocks - stat.bfree) / stat.blocks) * 100).toFixed(1)),
    };
  } catch (diskErr) {
    // Non-fatal if statfs is unsupported on host
  }

  const poolMetrics = pool.pool
    ? {
        totalConnections: pool.pool._allConnections ? pool.pool._allConnections.length : 0,
        freeConnections: pool.pool._freeConnections ? pool.pool._freeConnections.length : 0,
        waitingRequests: pool.pool._connectionQueue ? pool.pool._connectionQueue.length : 0,
      }
    : null;

  return res.status(dbStatus === "CONNECTED" ? 200 : 503).json({
    status: dbStatus === "CONNECTED" ? "UP" : "DEGRADED",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    connectionPool: poolMetrics,
    storage: diskMetrics,
    memory: {
      rssMb: parseFloat((memory.rss / (1024 * 1024)).toFixed(2)),
      heapUsedMb: parseFloat((memory.heapUsed / (1024 * 1024)).toFixed(2)),
      heapTotalMb: parseFloat((memory.heapTotal / (1024 * 1024)).toFixed(2)),
    },
  });
});

// =====================================
// Global Rate Limiting
// =====================================
app.use("/api", generalLimiter);

// Specific Auth Rate Limiting for Login & Password Reset Endpoints
app.use("/api/admin/login", authLimiter);
app.use("/api/admin/forgot-password", authLimiter);
app.use("/api/admin/reset-password", authLimiter);

// =====================================
// API Routes Mount
// =====================================
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminForgetpasswordRoutes);
app.use("/api/admin", announcementRoutes);
app.use("/api/admin", calendarRoutes);
app.use("/api/admin", thirukkuralRoutes);
app.use("/api/admin", galleryRoutes);
app.use("/api/admin", profileRoutes);

// =====================================
// 404 Route Handler
// =====================================
app.use((req, res, next) => {
  if (res.headersSent) {
    return next();
  }
  return res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// =====================================
// Centralized Error Handling Middleware
// =====================================
app.use((err, req, res, next) => {
  console.error("Centralized Server Error:", err.stack || err.message || err);
  if (res.headersSent) {
    return next(err);
  }
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// =====================================
// Server Startup and Graceful Shutdown
// =====================================
let serverInstance = null;

const StartServer = () => {
  serverInstance = app.listen(PORT, async () => {
    console.log(`🚀 Brito School Express Server running on port ${PORT}`);

    // Terminal DB Connection Verification
    try {
      const connection = await pool.getConnection();
      console.log("✅ MySQL Database Connected Successfully!");
      connection.release();
    } catch (error) {
      console.error("❌ MySQL Database Connection Failed:", error.message);
    }
  });

  return serverInstance;
};

// Graceful Shutdown Handlers
const handleGracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Initiating graceful shutdown...`);
  if (serverInstance) {
    serverInstance.close(async () => {
      console.log("Closed remaining HTTP connections.");
      try {
        await pool.end();
        console.log("MySQL connection pool closed.");
        process.exit(0);
      } catch (err) {
        console.error("Error closing MySQL pool during shutdown:", err.message);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));

if (require.main === module) {
  StartServer();
}

module.exports = app;
