const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

exports.signup = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Email and password are required'
    });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({
        success: false,
        data: null,
        message: 'Error hashing password'
      });
    }
    User.create({ email, password: hash, role: 'user' }, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          data: null,
          message: 'Error creating user'
        });
      }
      res.status(201).json({
        success: true,
        data: { userId: result.insertId },
        message: 'User registered successfully'
      });
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Email and password are required'
    });
  }

  User.findByEmail(email, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        data: null,
        message: 'Database error'
      });
    }
    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid credentials'
      });
    }
    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({
          success: false,
          data: null,
          message: 'Error comparing passwords'
        });
      }
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          data: null,
          message: 'Invalid credentials'
        });
      }
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '1h' });
      res.json({
        success: true,
        data: { token, user: { id: user.id, email: user.email, role: user.role } },
        message: 'Login successful'
      });
    });
  });
};
