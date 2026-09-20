const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for auth endpoints (login + register).
 * Limits each IP to 10 attempts per 15-minute window to prevent brute-force attacks.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts from this IP — please try again after 15 minutes.',
    errors: [],
  },
});

module.exports = { authLimiter };
