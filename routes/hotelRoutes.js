const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, requireAdmin, hotelController.createHotel);
router.get('/', hotelController.getAllHotels);
router.get('/:id', hotelController.getHotelById);
router.put('/:id', authenticateToken, requireAdmin, hotelController.updateHotel);
router.delete('/:id', authenticateToken, requireAdmin, hotelController.deleteHotel);

// Additional endpoints
router.get('/countries', hotelController.getCountries);
router.get('/currency/convert', hotelController.convertCurrency);

module.exports = router;
