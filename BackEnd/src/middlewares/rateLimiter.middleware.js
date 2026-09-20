const rateLimit = require('express-rate-limit');


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
