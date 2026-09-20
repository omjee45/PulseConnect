const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');


function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return next(new ApiError(401, 'Unauthorized — no token provided'));
    }

    // JWT_SECRET comes from environment — never hardcoded
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    // Always return a response — no silent fall-through
    return next(new ApiError(401, 'Unauthorized — invalid or expired token'));
  }
}

module.exports = authMiddleware;
