const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = "Too many requests. Please try again later.",
  maxKeys = 20000,
} = {}) => {
  const hits = new Map();

  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, 60 * 1000);

  if (interval.unref) {
    interval.unref();
  }

  return (req, res, next) => {
    if (process.env.NODE_ENV === "test" && process.env.DISABLE_RATE_LIMIT === "true") {
      return next();
    }

    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    if (hits.size > maxKeys) {
      hits.clear();
    }

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

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many authentication attempts. Please try again later.",
});

const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Rate limit exceeded. Please slow down your requests.",
});

module.exports = {
  createRateLimiter,
  authLimiter,
  generalLimiter,
};
