const jwt = require('jsonwebtoken');

/**
 * Socket.io authentication middleware.
 * Supports two token sources (in order of priority):
 *   1. socket.handshake.auth.token (explicit — preferred when available)
 *   2. HTTP-only cookie 'token' (fallback — sent automatically by browser with withCredentials:true)
 *
 * The cookie fallback is needed because we use HTTP-only cookies for REST auth,
 * so JS can't read the token to pass it explicitly. The browser sends the cookie
 * automatically on the WebSocket upgrade request.
 */
function socketAuthMiddleware(socket, next) {
  try {
    // 1. Try explicit token from handshake.auth
    let token = socket.handshake.auth?.token;

    // 2. Fall back to cookie (sent automatically when withCredentials: true)
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
