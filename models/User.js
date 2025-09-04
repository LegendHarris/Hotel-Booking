const mysql = require('mysql2');
const { dbConfig } = require('../config/config');

const db = mysql.createConnection(dbConfig);

class User {
  static create(userData, callback) {
    const { username, email, password } = userData;
    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, password], callback);
  }

  static findByEmail(email, callback) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], callback);
  }

  static findById(id, callback) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.query(sql, [id], callback);
  }
}

module.exports = User;
