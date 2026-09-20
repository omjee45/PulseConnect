const ApiError = require('../utils/ApiError');

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `Access denied — requires role: ${roles.join(' or ')}`));
    }
    next();
  };
}

module.exports = requireRole;
