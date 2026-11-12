require("dotenv").config();
const path = require("path");
const fs = require("fs");
const zlib = require("zlib");
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const { authLimiter, generalLimiter } = require("./admin/middleware/rateLimiter");

const adminRoutes = require("./admin/routes/adminAuthRoutes");
const adminForgetpasswordRoutes = require("./admin/routes/adminForgetpasswordRoutes");
const announcementRoutes = require("./admin/routes/announcementRoutes");
const calendarRoutes = require("./admin/routes/calendarRoutes");
const thirukkuralRoutes = require("./admin/routes/thirukkuralRoutes");
const galleryRoutes = require("./admin/routes/galleryRoutes");
const profileRoutes = require("./admin/routes/profileRoutes");
const dashboardRoutes = require("./admin/routes/dashboardRoutes");
const publicRoutes = require("./public/routes/publicRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const SHUTDOWN_TIMEOUT_MS = 10000;
const DISK_METRICS_TTL_MS = 30000;
const GZIP_MIN_BYTES = 1024;

let serverInstance = null;
let isShuttingDown = false;
let diskMetricsCache = { value: null, expiresAt: 0 };

process.on("unhandledRejection", (reason) => {
  console.error("Critical: Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Critical: Uncaught Exception thrown:", error);
  handleGracefulShutdown("uncaughtException");
});

app.disable("x-powered-by");

if (process.env.TRUST_PROXY === "true" || process.env.TRUST_PROXY === "1") {
  app.set("trust proxy", 1);
}

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

const corsOptions = process.env.CORS_ORIGIN
  ? { origin: process.env.CORS_ORIGIN.split(",").map((s) => s.trim()) }
  : {};
app.use(cors(corsOptions));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use((req, res, next) => {
  const acceptEncoding = req.headers["accept-encoding"] || "";
  if (!/\bgzip\b/i.test(acceptEncoding)) {
    return next();
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const payload = JSON.stringify(body);
    if (!payload || payload.length < GZIP_MIN_BYTES) {
      return originalJson(body);
    }

    zlib.gzip(payload, (err, compressed) => {
      if (err || res.headersSent) {
        return originalJson(body);
      }
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Content-Encoding", "gzip");
      res.setHeader("Vary", "Accept-Encoding");
      return res.send(compressed);
    });
    return res;
  };

  next();
});

const uploadsPath = path.join(__dirname, "uploads");
app.use(
  "/uploads",
  express.static(uploadsPath, {
    maxAge: "1d",
    etag: true,
  })
);

app.use("/docs", express.static(path.join(__dirname, "docs")));

const readDiskMetrics = async () => {
  const now = Date.now();
  if (diskMetricsCache.value && now < diskMetricsCache.expiresAt) {
    return diskMetricsCache.value;
  }

  try {
    const stat = await fs.promises.statfs(uploadsPath);
    const value = {
      freeGb: parseFloat(((stat.bfree * stat.bsize) / 1024 ** 3).toFixed(2)),
      totalGb: parseFloat(((stat.blocks * stat.bsize) / 1024 ** 3).toFixed(2)),
      usagePercent: parseFloat((((stat.blocks - stat.bfree) / stat.blocks) * 100).toFixed(1)),
    };
    diskMetricsCache = { value, expiresAt: now + DISK_METRICS_TTL_MS };
    return value;
  } catch (diskErr) {
    return null;
  }
};

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
  const diskMetrics = await readDiskMetrics();

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

app.use("/api/admin/login", authLimiter);
app.use("/api/admin/forgot-password", authLimiter);
app.use("/api/admin/reset-password", authLimiter);
app.use("/api", generalLimiter);

// Public Content Routes (Unauthenticated, Read-Heavy, In-Memory Cached)
app.use("/api/public", publicRoutes);
app.use("/api", publicRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminForgetpasswordRoutes);
app.use("/api/admin", announcementRoutes);
app.use("/api/admin", calendarRoutes);
app.use("/api/admin", thirukkuralRoutes);
app.use("/api/admin", galleryRoutes);
app.use("/api/admin", profileRoutes);
app.use("/api/admin", dashboardRoutes);

app.use((req, res, next) => {
  if (res.headersSent) {
    return next();
  }
  return res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const isBusy =
    err.code === "ER_CON_COUNT_ERROR" ||
    (typeof err.message === "string" && err.message.includes("Queue limit"));

  if (isBusy) {
    return res.status(503).json({
      success: false,
      message: "Server is busy. Please try again shortly.",
    });
  }

  const isJsonParseError =
    err.type === "entity.parse.failed" ||
    err instanceof SyntaxError && err.status === 400 && "body" in err;

  if (isJsonParseError) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload",
    });
  }

  console.error("Centralized Server Error:", err.stack || err.message || err);

  const clientMessage =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  return res.status(err.status || 500).json({
    success: false,
    message: clientMessage,
  });
});

const StartServer = () => {
  serverInstance = app.listen(PORT, async () => {
    console.log(`Brito School Express Server running on port ${PORT}`);

    try {
      const connection = await pool.getConnection();
      console.log("MySQL Database Connected Successfully!");
      connection.release();
    } catch (error) {
      console.error("MySQL Database Connection Failed:", error.message);
    }
  });

  serverInstance.keepAliveTimeout = 65000;
  serverInstance.headersTimeout = 66000;
  serverInstance.requestTimeout = 120000;

  return serverInstance;
};

const handleGracefulShutdown = async (signal) => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;
  console.log(`\nReceived ${signal}. Initiating graceful shutdown...`);

  const forceExit = setTimeout(() => {
    console.error("Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  if (forceExit.unref) {
    forceExit.unref();
  }

  const closePoolAndExit = async () => {
    try {
      await pool.end();
      console.log("MySQL connection pool closed.");
      process.exit(0);
    } catch (err) {
      console.error("Error closing MySQL pool during shutdown:", err.message);
      process.exit(1);
    }
  };

  if (serverInstance) {
    serverInstance.close(() => {
      console.log("Closed remaining HTTP connections.");
      closePoolAndExit();
    });
  } else {
    await closePoolAndExit();
  }
};

process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));

if (require.main === module) {
  StartServer();
}

module.exports = app;
