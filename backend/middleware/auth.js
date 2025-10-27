const { verifyToken } = require('../utils/jwt');
const User = require('../models/userSchema');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    console.log('🔐 Auth Middleware - Header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Bearer token provided');
      const error = new Error('No token provided. Please include Authorization: Bearer <token>');
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(' ')[1];
    console.log('🔑 Token extracted (first 20 chars):', token.substring(0, 20) + '...');

    // Verify token
    const decoded = verifyToken(token);
    console.log('✅ Token verified. User ID:', decoded.id);

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('❌ User not found in database:', decoded.id);
      const error = new Error('User not found');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      console.log('❌ User account deactivated:', decoded.id);
      const error = new Error('User account is deactivated');
      error.statusCode = 401;
      throw error;
    }

    console.log('✅ User authenticated:', user.email);
    
    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.log('❌ Auth Error:', err.message);
    if (err.message === 'Invalid or expired token') {
      err.statusCode = 401;
    }
    next(err);
  }
};

module.exports = auth;
