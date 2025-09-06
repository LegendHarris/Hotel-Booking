const jwt = require('jsonwebtoken');
const EnhancedUser = require('../models/EnhancedUser');
const { validateInput } = require('../middleware/security');

class EnhancedAuthController {
  // User registration
  static async signup(req, res) {
    try {
      const { email, password, first_name, last_name, phone } = req.body;

      // Validate required fields
      if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, first name, and last name are required',
          data: null
        });
      }

      // Check if user already exists
      const existingUser = await EnhancedUser.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists',
          data: null
        });
      }

      // Create new user
      const userData = {
        email,
        password,
        role: 'user', // Default role
        first_name,
        last_name,
        phone
      };

      await EnhancedUser.create(userData);
      
      // Get created user (without password)
      const newUser = await EnhancedUser.findByEmail(email);
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: newUser.id, 
          email: newUser.email, 
          role: newUser.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            phone: newUser.phone
          },
          token
        }
      });

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration',
        data: null
      });
    }
  }

  // User login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
          data: null
        });
      }

      // Find user by email
      const user = await EnhancedUser.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          data: null
        });
      }

      // Verify password
      const isValidPassword = await EnhancedUser.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          data: null
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone
          },
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login',
        data: null
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = await EnhancedUser.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          data: null
        });
      }

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const { first_name, last_name, phone } = req.body;
      const userId = req.user.userId;

      await EnhancedUser.updateProfile(userId, { first_name, last_name, phone });
      
      const updatedUser = await EnhancedUser.findById(userId);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const { current_password, new_password } = req.body;
      const userId = req.user.userId;

      if (!current_password || !new_password) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required',
          data: null
        });
      }

      // Get user with password
      const user = await EnhancedUser.findByEmail(req.user.email);
      
      // Verify current password
      const isValidPassword = await EnhancedUser.verifyPassword(current_password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
          data: null
        });
      }

      // Update password
      await EnhancedUser.changePassword(userId, new_password);

      res.json({
        success: true,
        message: 'Password changed successfully',
        data: null
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  // Admin: Get all users
  static async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await EnhancedUser.getAll(page, limit);

      res.json({
        success: true,
        message: 'Users retrieved successfully',
        data: result
      });

    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
      });
    }
  }

  // Verify JWT token middleware
  static verifyToken(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided',
        data: null
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
        data: null
      });
    }
  }

  // Admin role middleware
  static requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required',
        data: null
      });
    }
    next();
  }
}

module.exports = EnhancedAuthController;