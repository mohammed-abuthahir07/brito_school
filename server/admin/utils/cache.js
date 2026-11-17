const crypto = require("node:crypto");

class ContentCache {
  constructor(defaultTtlMs = 5 * 60 * 1000, maxEntries = 200) {
    this.defaultTtlMs = defaultTtlMs;
    this.maxEntries = maxEntries;
    this.store = new Map();
    this.inflight = new Map();
    this.generations = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  generation(namespace) {
    return this.generations.get(namespace || "general") || 0;
  }

  generateEtag(jsonStr) {
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

  set(key, data, namespace, ttlMs = this.defaultTtlMs, expectedGeneration) {
    const ns = namespace || "general";
    const currentGeneration = this.generation(ns);
    if (expectedGeneration !== undefined && expectedGeneration !== currentGeneration) {
      return null;
    }

    const jsonStr = JSON.stringify(data);
    const etag = this.generateEtag(jsonStr);
    const entry = {
      data,
      jsonStr,
      etag,
      namespace: ns,
      generation: currentGeneration,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
    };
    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) {
        this.store.delete(oldestKey);
      }
    }
    this.store.set(key, entry);
    return entry;
  }

  toEphemeralEntry(data, namespace) {
    const jsonStr = JSON.stringify(data);
    return {
      data,
      jsonStr,
      etag: this.generateEtag(jsonStr),
      namespace: namespace || "general",
      cachedAt: Date.now(),
      ephemeral: true,
    };
  }

  async load(key, namespace, fetchFn) {
    const cached = this.get(key);
    if (cached) {
      return cached;
    }

    const ns = namespace || "general";
    const generation = this.generation(ns);
    const inflightKey = `${ns}::${key}::${generation}`;
    let pending = this.inflight.get(inflightKey);
    if (!pending) {
      pending = Promise.resolve()
        .then(fetchFn)
        .then((data) => {
          const entry = this.set(key, data, ns, this.defaultTtlMs, generation);
          return entry || this.toEphemeralEntry(data, ns);
        })
        .finally(() => {
          this.inflight.delete(inflightKey);
        });
      this.inflight.set(inflightKey, pending);
    }

    return pending;
  }

  invalidate(namespace) {
    if (!namespace) {
      for (const ns of this.generations.keys()) {
        this.generations.set(ns, this.generation(ns) + 1);
      }
      this.generations.set("general", this.generation("general") + 1);
      this.store.clear();
      return;
    }

    this.generations.set(namespace, this.generation(namespace) + 1);
    for (const [key, entry] of this.store.entries()) {
      if (entry.namespace === namespace || key.startsWith(namespace)) {
        this.store.delete(key);
      }
    }
  }

  clear() {
    this.store.clear();
    this.inflight.clear();
    this.generations.clear();
    this.hits = 0;
    this.misses = 0;
  }

  stats() {
    return {
      size: this.store.size,
      hits: this.hits,
      misses: this.misses,
      inflight: this.inflight.size,
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
