const socketAuthMiddleware = require('./auth.socket');
const registerChatHandlers = require('./chat.socket');


function initSockets(io) {
  // Every socket must pass auth before 'connection' fires
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    registerChatHandlers(io, socket);
  });
}

module.exports = initSockets;
