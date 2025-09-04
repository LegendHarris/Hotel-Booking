const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, bookingController.createBooking);
router.get('/', authenticateToken, bookingController.getUserBookings);
router.delete('/:id', authenticateToken, bookingController.deleteBooking);

module.exports = router;
