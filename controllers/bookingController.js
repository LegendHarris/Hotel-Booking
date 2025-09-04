const Booking = require('../models/Booking');

exports.createBooking = (req, res) => {
  const bookingData = { ...req.body, user_id: req.user.id };
  Booking.create(bookingData, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: 'Booking created', bookingId: result.insertId });
  });
};

exports.getUserBookings = (req, res) => {
  const user_id = req.user.id;
  Booking.findByUserId(user_id, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

exports.deleteBooking = (req, res) => {
  const id = req.params.id;
  Booking.findById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Booking not found' });
    if (results[0].user_id !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    Booking.delete(id, (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Booking deleted' });
    });
  });
};
