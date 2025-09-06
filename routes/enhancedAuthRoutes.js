const express = require('express');
const router = express.Router();
const EnhancedAuthController = require('../controllers/enhancedAuthController');
const { validateInput } = require('../middleware/security');

// Public routes
router.post('/signup', 
  validateInput({
    email: { required: true, email: true },
    password: { required: true, minLength: 8 },
    first_name: { required: true, minLength: 2 },
    last_name: { required: true, minLength: 2 }
  }),
  EnhancedAuthController.signup
);

router.post('/verify',
  validateInput({
    email: { required: true, email: true },
    code: { required: true, minLength: 6, maxLength: 6 }
  }),
  EnhancedAuthController.verify
);

router.post('/login',
  validateInput({
    email: { required: true, email: true },
    password: { required: true }
  }),
  EnhancedAuthController.login
);

// Protected routes (require authentication)
router.get('/profile', 
  EnhancedAuthController.verifyToken,
  EnhancedAuthController.getProfile
);

router.put('/profile',
  EnhancedAuthController.verifyToken,
  validateInput({
    first_name: { minLength: 2 },
    last_name: { minLength: 2 }
  }),
  EnhancedAuthController.updateProfile
);

router.put('/change-password',
  EnhancedAuthController.verifyToken,
  validateInput({
    current_password: { required: true },
    new_password: { required: true, minLength: 8 }
  }),
  EnhancedAuthController.changePassword
);

// Admin only routes
router.get('/users',
  EnhancedAuthController.verifyToken,
  EnhancedAuthController.requireAdmin,
  EnhancedAuthController.getAllUsers
);

module.exports = router;