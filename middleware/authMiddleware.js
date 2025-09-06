const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Access token missing'
    });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Invalid token'
      });
    }
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      data: null,
      message: 'Admin access required'
    });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin };
