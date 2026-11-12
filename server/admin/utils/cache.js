const crypto = require("node:crypto");

// =====================================================================
// High-Performance In-Memory Cache with Instant Namespace Invalidation
// Zero external dependencies, TTL support, ETag generation, 304 handling
// =====================================================================

class ContentCache {
  constructor(defaultTtlMs = 5 * 60 * 1000) {
    this.defaultTtlMs = defaultTtlMs;
    this.store = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  generateEtag(payload) {
    const jsonStr = typeof payload === "string" ? payload : JSON.stringify(payload);
    return `"${crypto.createHash("md5").update(jsonStr).digest("hex")}"`;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry;
  }

  set(key, data, namespace, ttlMs = this.defaultTtlMs) {
    const etag = this.generateEtag(data);
    const entry = {
      data,
      etag,
      namespace: namespace || "general",
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
    };
    this.store.set(key, entry);
    return entry;
  }

  invalidate(namespace) {
    if (!namespace) {
      this.store.clear();
      return;
    }

    for (const [key, entry] of this.store.entries()) {
      if (entry.namespace === namespace || key.startsWith(namespace)) {
        this.store.delete(key);
      }
    }
  }

  clear() {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  stats() {
    return {
      size: this.store.size,
      hits: this.hits,
      misses: this.misses,
      hitRatio:
        this.hits + this.misses > 0
          ? parseFloat(((this.hits / (this.hits + this.misses)) * 100).toFixed(2))
          : 0,
    };
  }
}

const contentCache = new ContentCache();

module.exports = {
  contentCache,
  ContentCache,
};
