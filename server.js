const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Import middleware
const { securityHeaders, createRateLimit, sanitizeInput } = require('./middleware/security');
const { compressionMiddleware, responseTime, cacheMiddleware } = require('./middleware/performance');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);
app.use(createRateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 minutes

// Performance middleware
app.use(compressionMiddleware);
app.use(responseTime);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Serve static files with caching
app.use(express.static('.', {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
  etag: true,
  lastModified: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// API Routes with caching where appropriate
app.use('/api/auth', createRateLimit(15 * 60 * 1000, 5), authRoutes);
app.use('/api/hotels', cacheMiddleware(5 * 60 * 1000), hotelRoutes);
app.use('/api/bookings', bookingRoutes);

// Root endpoint
const path = require('path');

// Root endpoint
// Root endpoint
app.get('/', (req, res) => {
  const indexPath = path.join(process.cwd(), 'index.html');
  console.log('Serving index.html for / from path:', indexPath);
  res.sendFile(indexPath);
});

// Fallback route for SPA support
app.get('*', (req, res) => {
  const indexPath = path.join(process.cwd(), 'index.html');
  console.log(`Fallback route hit for ${req.originalUrl}, serving index.html from path:`, indexPath);
  res.sendFile(indexPath);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large' });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

const server = app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🌐 API Base: http://localhost:${port}/api`);
});
