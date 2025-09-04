const mysql = require('mysql2');
const { dbConfig } = require('../config/config');

const db = mysql.createConnection(dbConfig);

class Hotel {
  static create(hotelData, callback) {
    const { name, country, city, price_per_night, currency, description } = hotelData;
    const sql = 'INSERT INTO hotels (name, country, city, price_per_night, currency, description) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, country, city, price_per_night, currency, description], callback);
  }

  static findAll(callback) {
    const sql = 'SELECT * FROM hotels';
    db.query(sql, callback);
  }

  static findById(id, callback) {
    const sql = 'SELECT * FROM hotels WHERE id = ?';
    db.query(sql, [id], callback);
  }

  static update(id, hotelData, callback) {
    const { name, country, city, price_per_night, currency, description } = hotelData;
    const sql = 'UPDATE hotels SET name = ?, country = ?, city = ?, price_per_night = ?, currency = ?, description = ? WHERE id = ?';
    db.query(sql, [name, country, city, price_per_night, currency, description, id], callback);
  }

  static delete(id, callback) {
    const sql = 'DELETE FROM hotels WHERE id = ?';
    db.query(sql, [id], callback);
  }
}

module.exports = Hotel;
