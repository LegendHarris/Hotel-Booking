const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const { dbConfig } = require('../config/config');

const db = mysql.createConnection(dbConfig);

class User {
  static create(userData, callback) {
    const { email, password, role = 'user' } = userData;
    const sql = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
    db.query(sql, [email, password, role], callback);
  }

  static findByEmail(email, callback) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], callback);
  }

  static findById(id, callback) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.query(sql, [id], callback);
  }

  static seedAdmin(callback) {
    const adminEmail = 'solutionlegend9@gmail.com';
    const adminPassword = 'Legend07';
    const adminRole = 'admin';

    // Check if admin already exists
    this.findByEmail(adminEmail, (err, results) => {
      if (err) return callback(err);
      if (results.length > 0) return callback(null, 'Admin already exists');

      // Hash password and create admin
      bcrypt.hash(adminPassword, 10, (err, hash) => {
        if (err) return callback(err);
        this.create({ email: adminEmail, password: hash, role: adminRole }, callback);
      });
    });
  }
}

module.exports = User;
