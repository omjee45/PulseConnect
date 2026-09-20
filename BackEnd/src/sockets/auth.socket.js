const jwt = require('jsonwebtoken');


function socketAuthMiddleware(socket, next) {
  try {
    let token = socket.handshake.auth?.token;

    if (!token) {
      const rawCookie = socket.handshake.headers.cookie || '';
      const match = rawCookie.match(/(?:^|;\s*)token=([^;]+)/);
      token = match ? match[1] : null;
    }

    if (!token) {
      return next(new Error('UNAUTHORIZED: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    return next(new Error('UNAUTHORIZED: Invalid or expired token'));
  }
}

module.exports = socketAuthMiddleware;
