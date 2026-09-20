const onlineUsers = new Map();

function addUser(userId, socketId) {
  onlineUsers.set(userId.toString(), socketId);
}

function removeUser(userId) {
  onlineUsers.delete(userId.toString());
}

function getSocketId(userId) {
  return onlineUsers.get(userId.toString());
}

function getOnlineUserIds() {
  return Array.from(onlineUsers.keys());
}

module.exports = { onlineUsers, addUser, removeUser, getSocketId, getOnlineUserIds };
