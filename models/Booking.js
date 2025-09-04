const mysql = require('mysql2');
const { dbConfig } = require('../config/config');

const db = mysql.createConnection(dbConfig);

class Booking {
  static create(bookingData, callback) {
    const { user_id, hotel_id, check_in_date, check_out_date } = bookingData;
    const sql = 'INSERT INTO bookings (user_id, hotel_id, check_in_date, check_out_date) VALUES (?, ?, ?, ?)';
    db.query(sql, [user_id, hotel_id, check_in_date, check_out_date], callback);
  }

  static findByUserId(user_id, callback) {
    const sql = 'SELECT b.*, h.name, h.location FROM bookings b JOIN hotels h ON b.hotel_id = h.id WHERE b.user_id = ?';
    db.query(sql, [user_id], callback);
  }

  static findById(id, callback) {
    const sql = 'SELECT * FROM bookings WHERE id = ?';
    db.query(sql, [id], callback);
  }

  static delete(id, callback) {
    const sql = 'DELETE FROM bookings WHERE id = ?';
    db.query(sql, [id], callback);
  }
}

module.exports = Booking;
