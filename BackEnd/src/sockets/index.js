const socketAuthMiddleware = require('./auth.socket');
const registerChatHandlers = require('./chat.socket');

/**
 * Initializes Socket.io:
 *  1. Applies JWT auth middleware to ALL socket connections (rejects unauthenticated)
 *  2. Registers chat event handlers for each authenticated connection
 */
function initSockets(io) {
  // Every socket must pass auth before 'connection' fires
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    registerChatHandlers(io, socket);
  });
}

module.exports = initSockets;
