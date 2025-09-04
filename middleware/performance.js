const compression = require('compression');
const mysql = require('mysql2');
const { dbConfig } = require('../config/config');

// Create connection pool for better performance
const pool = mysql.createPool({
  ...dbConfig,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Promisify pool for async/await
const promisePool = pool.promise();

// Compression middleware
const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
});

// Caching middleware
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const cacheMiddleware = (duration = CACHE_TTL) => {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < duration) {
      res.set('X-Cache', 'HIT');
      return res.json(cached.data);
    }
    
    res.set('X-Cache', 'MISS');
    const originalJson = res.json;
    
    res.json = function(data) {
      cache.set(key, { data, timestamp: Date.now() });
      
      // Clean old cache entries
      if (cache.size > 100) {
        const entries = Array.from(cache.entries());
        const now = Date.now();
        entries.forEach(([k, v]) => {
          if (now - v.timestamp > duration) {
            cache.delete(k);
          }
        });
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Response time middleware
const responseTime = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    res.set('X-Response-Time', `${duration}ms`);
    
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.originalUrl} took ${duration}ms`);
    }
  });
  
  next();
};

// Database query optimization
const optimizedQuery = async (sql, params = []) => {
  const start = Date.now();
  try {
    const [results] = await promisePool.execute(sql, params);
    const duration = Date.now() - start;
    
    if (duration > 500) {
      console.warn(`Slow query (${duration}ms): ${sql}`);
    }
    
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

module.exports = {
  pool: promisePool,
  compressionMiddleware,
  cacheMiddleware,
  responseTime,
  optimizedQuery
};