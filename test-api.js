const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { dbConfig } = require('./config/config');

const app = express();
const port = 3001; // Use different port for testing

// Enable CORS for frontend-backend communication
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection(dbConfig);

// Test API endpoints
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend API is working!', 
        timestamp: new Date().toISOString(),
        status: 'success'
    });
});

app.get('/api/hotels/test', (req, res) => {
    db.query('SELECT id, name, location, price FROM hotels LIMIT 3', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Database error', details: err.message });
            return;
        }
        res.json({ 
            message: 'Hotels API working!', 
            hotels: results,
            count: results.length
        });
    });
});

app.get('/api/users/test', (req, res) => {
    db.query('SELECT COUNT(*) as count FROM users', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Database error', details: err.message });
            return;
        }
        res.json({ 
            message: 'Users API working!', 
            userCount: results[0].count
        });
    });
});

app.get('/api/bookings/test', (req, res) => {
    db.query('SELECT COUNT(*) as count FROM bookings', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Database error', details: err.message });
            return;
        }
        res.json({ 
            message: 'Bookings API working!', 
            bookingCount: results[0].count
        });
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    db.ping((err) => {
        if (err) {
            res.status(500).json({ 
                status: 'unhealthy', 
                database: 'disconnected',
                error: err.message 
            });
            return;
        }
        res.json({ 
            status: 'healthy', 
            database: 'connected',
            uptime: process.uptime(),
            memory: process.memoryUsage()
        });
    });
});

// Start test server
app.listen(port, () => {
    console.log(`🧪 Test API server running on http://localhost:${port}`);
    console.log('📋 Available test endpoints:');
    console.log(`   GET http://localhost:${port}/api/test`);
    console.log(`   GET http://localhost:${port}/api/hotels/test`);
    console.log(`   GET http://localhost:${port}/api/users/test`);
    console.log(`   GET http://localhost:${port}/api/bookings/test`);
    console.log(`   GET http://localhost:${port}/health`);
    
    // Test database connection
    db.connect((err) => {
        if (err) {
            console.log('❌ Database connection failed:', err.message);
        } else {
            console.log('✅ Database connected successfully');
        }
    });
});