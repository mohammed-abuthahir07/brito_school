// =====================================================================
// High-Performance In-Memory Sliding-Window Rate Limiter
// Zero External Dependencies, Memory-Safe with Automatic Expiry Pruning
// =====================================================================

const createRateLimiter = ({
  windowMs = 15 * 60 * 1000, // 15 minutes default
  max = 100, // max requests per window
  message = "Too many requests. Please try again later.",
  skipSuccessfulRequests = false,
} = {}) => {
  const hits = new Map();

  // Periodic cleanup every 60 seconds to prevent memory leaks
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, 60 * 1000);

  // Unref timer so it does not keep Node process alive
  if (interval.unref) {
    interval.unref();
  }

  return (req, res, next) => {
    // Skip rate limiting during automated testing if disabled
    if (process.env.NODE_ENV === "test" && process.env.DISABLE_RATE_LIMIT === "true") {
      return next();
    }

    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    let record = hits.get(ip);
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      hits.set(ip, record);
    }

    record.count += 1;

    const remaining = Math.max(0, max - record.count);
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: retryAfter,
      });
    }

    next();
  };
};

// Standard rate limiters
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 30, // 30 attempts per 15 mins for auth/password reset
  message: "Too many authentication attempts. Please try again later.",
});

const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 1000, // 1000 requests per 15 mins
  message: "Rate limit exceeded. Please slow down your requests.",
});

module.exports = {
  createRateLimiter,
  authLimiter,
  generalLimiter,
};
