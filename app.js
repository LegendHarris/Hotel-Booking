const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Database connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Legend@07',
  database: 'hotel_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Generate verification code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// JWT middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, 'hotel_reservation_jwt_secret_2024', (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Admin middleware
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

// Currency conversion
async function convertCurrency(amount, from, to) {
  try {
    const response = await axios.get(`https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`);
    return response.data.result;
  } catch (error) {
    return amount;
  }
}

// Initialize database
async function initDatabase() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        verification_code VARCHAR(6),
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS hotels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        country VARCHAR(100) NOT NULL,
        city VARCHAR(100) NOT NULL,
        price_per_night DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        description TEXT,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        hotel_id INT NOT NULL,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (hotel_id) REFERENCES hotels(id)
      )
    `);

    // Insert sample hotels
    const [hotelCount] = await db.execute('SELECT COUNT(*) as count FROM hotels');
    if (hotelCount[0].count === 0) {
      await db.execute(`
        INSERT INTO hotels (name, country, city, price_per_night, currency, description, image_url) VALUES
        ('Lagos Grand Hotel', 'Nigeria', 'Lagos', 150.00, 'USD', 'Luxury hotel in Victoria Island', 'https://images.unsplash.com/photo-1566073771259-6a8506099945'),
        ('Cape Town Lodge', 'South Africa', 'Cape Town', 120.00, 'USD', 'Beautiful hotel with mountain views', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d'),
        ('Nairobi Safari Hotel', 'Kenya', 'Nairobi', 200.00, 'USD', 'Safari-themed luxury accommodation', 'https://images.unsplash.com/photo-1520637836862-4d197d17c93a'),
        ('Accra Beach Resort', 'Ghana', 'Accra', 180.00, 'USD', 'Beachfront resort with modern amenities', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9'),
        ('Cairo Palace', 'Egypt', 'Cairo', 100.00, 'USD', 'Historic hotel near the pyramids', 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e')
      `);
    }

    // Create admin user
    const [adminExists] = await db.execute('SELECT id FROM users WHERE email = ?', ['solutionlegend9@gmail.com']);
    if (adminExists.length === 0) {
      const hashedPassword = await bcrypt.hash('Legend07', 10);
      await db.execute(
        'INSERT INTO users (name, email, password, is_verified, role) VALUES (?, ?, ?, ?, ?)',
        ['Admin', 'solutionlegend9@gmail.com', hashedPassword, true, 'admin']
      );
      console.log('✅ Admin user created');
    }

    console.log('✅ Database initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Routes

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateCode();

    await db.execute(
      'INSERT INTO users (name, email, password, verification_code) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, verificationCode]
    );

    console.log(`Verification code for ${email}: ${verificationCode}`);
    res.json({ success: true, message: 'Verification code sent to email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    const [users] = await db.execute(
      'SELECT id FROM users WHERE email = ? AND verification_code = ?',
      [email, code]
    );

    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    await db.execute(
      'UPDATE users SET is_verified = TRUE, verification_code = NULL WHERE email = ?',
      [email]
    );

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.execute(
      'SELECT id, name, email, password, role, is_verified FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];

    if (!user.is_verified) {
      return res.status(400).json({ success: false, message: 'Please verify your email first' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      'hotel_reservation_jwt_secret_2024',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all hotels
app.get('/api/hotels', async (req, res) => {
  try {
    const { currency = 'USD' } = req.query;
    const [hotels] = await db.execute('SELECT * FROM hotels');

    if (currency !== 'USD') {
      for (let hotel of hotels) {
        hotel.price_per_night = await convertCurrency(hotel.price_per_night, 'USD', currency);
        hotel.currency = currency;
      }
    }

    res.json({ success: true, data: hotels });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get hotels by country
app.get('/api/hotels/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const { currency = 'USD' } = req.query;
    
    const [hotels] = await db.execute('SELECT * FROM hotels WHERE country = ?', [country]);

    if (currency !== 'USD') {
      for (let hotel of hotels) {
        hotel.price_per_night = await convertCurrency(hotel.price_per_night, 'USD', currency);
        hotel.currency = currency;
      }
    }

    res.json({ success: true, data: hotels });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { hotel_id, check_in, check_out } = req.body;
    const user_id = req.user.id;

    const [hotels] = await db.execute('SELECT price_per_night FROM hotels WHERE id = ?', [hotel_id]);
    if (hotels.length === 0) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const checkIn = new Date(check_in);
    const checkOut = new Date(check_out);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const total_price = hotels[0].price_per_night * nights;

    const [result] = await db.execute(
      'INSERT INTO bookings (user_id, hotel_id, check_in, check_out, total_price) VALUES (?, ?, ?, ?, ?)',
      [user_id, hotel_id, check_in, check_out, total_price]
    );

    res.json({ success: true, message: 'Booking created', booking_id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user bookings
app.get('/api/bookings/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id != userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [bookings] = await db.execute(`
      SELECT b.*, h.name as hotel_name, h.city, h.country 
      FROM bookings b 
      JOIN hotels h ON b.hotel_id = h.id 
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, [userId]);

    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Get all bookings
app.get('/api/admin/bookings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [bookings] = await db.execute(`
      SELECT b.*, h.name as hotel_name, h.city, h.country, u.name as user_name, u.email 
      FROM bookings b 
      JOIN hotels h ON b.hotel_id = h.id 
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `);

    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Add hotel
app.post('/api/admin/hotels', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, country, city, price_per_night, currency, description, image_url } = req.body;

    await db.execute(
      'INSERT INTO hotels (name, country, city, price_per_night, currency, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, country, city, price_per_night, currency, description, image_url]
    );

    res.json({ success: true, message: 'Hotel added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start server
async function startServer() {
  await initDatabase();
  
  app.listen(5000, () => {
    console.log('Hotel Reservation API running on http://localhost:5000');
  });
}

startServer();