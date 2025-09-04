require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hotel_db'
};

const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';

module.exports = { dbConfig, jwtSecret };
