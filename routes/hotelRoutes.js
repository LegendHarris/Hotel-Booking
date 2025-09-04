const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, hotelController.createHotel);
router.get('/', hotelController.getAllHotels);
router.get('/:id', hotelController.getHotelById);
router.put('/:id', authenticateToken, hotelController.updateHotel);
router.delete('/:id', authenticateToken, hotelController.deleteHotel);

module.exports = router;
