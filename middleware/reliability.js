const mysql = require('mysql2/promise');
const { dbConfig } = require('../config/config');

// Enhanced connection pool with retry logic
const pool = mysql.createPool({
  ...dbConfig,
  connectionLimit: 20,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  idleTimeout: 300000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Database query with automatic retry
async function reliableQuery(sql, params = [], maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error(`Query attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Database query failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

// Connection health check
async function checkDatabaseHealth() {
  try {
    await pool.execute('SELECT 1');
    return { healthy: true };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
}

// Graceful error handler
function handleDatabaseError(error, req, res, next) {
  console.error('Database error:', error);
  
  if (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(503).json({
      success: false,
      message: 'Database temporarily unavailable. Please try again.',
      data: null
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Database operation failed',
    data: null
  });
}

module.exports = {
  pool,
  reliableQuery,
  checkDatabaseHealth,
  handleDatabaseError
};