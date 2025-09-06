// In-memory cache with TTL
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  set(key, value, ttl = 300000) { // 5 minutes default
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set value
    this.cache.set(key, value);

    // Set expiration timer
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, ttl);

    this.timers.set(key, timer);
  }

  get(key) {
    return this.cache.get(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    return this.cache.delete(key);
  }

  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
  }
}

const cache = new MemoryCache();

// Cache middleware
function cacheResponse(duration = 300000) {
  return (req, res, next) => {
    const key = `${req.method}:${req.originalUrl}`;
    
    if (cache.has(key)) {
      const cachedData = cache.get(key);
      res.set('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    res.set('X-Cache', 'MISS');
    const originalJson = res.json;
    
    res.json = function(data) {
      if (res.statusCode === 200 && data.success) {
        cache.set(key, data, duration);
      }
      return originalJson.call(this, data);
    };

    next();
  };
}

module.exports = { cache, cacheResponse };