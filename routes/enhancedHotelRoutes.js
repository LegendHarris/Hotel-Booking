const express = require('express');
const router = express.Router();
const EnhancedHotelController = require('../controllers/enhancedHotelController');
const EnhancedAuthController = require('../controllers/enhancedAuthController');
const { validateInput } = require('../middleware/security');

// Public routes
router.get('/', EnhancedHotelController.getAllHotels);
router.get('/countries', EnhancedHotelController.getCountries);
router.get('/cities/:country', EnhancedHotelController.getCitiesByCountry);
router.get('/:id', EnhancedHotelController.getHotelById);

// Admin only routes
router.post('/',
  EnhancedAuthController.verifyToken,
  EnhancedAuthController.requireAdmin,
  validateInput({
    name: { required: true, minLength: 3 },
    country: { required: true, minLength: 2 },
    city: { required: true, minLength: 2 },
    price: { required: true, isNumeric: true }
  }),
  EnhancedHotelController.createHotel
);

router.put('/:id',
  EnhancedAuthController.verifyToken,
  EnhancedAuthController.requireAdmin,
  EnhancedHotelController.updateHotel
);

router.delete('/:id',
  EnhancedAuthController.verifyToken,
  EnhancedAuthController.requireAdmin,
  EnhancedHotelController.deleteHotel
);

router.get('/admin/stats',
  EnhancedAuthController.verifyToken,
  EnhancedAuthController.requireAdmin,
  EnhancedHotelController.getHotelStats
);

module.exports = router;