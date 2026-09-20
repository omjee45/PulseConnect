/**
 * Shared in-memory store for tracking online users.
 * Maps userId (string) → socketId (string).
 *
 * This module is a singleton — imported by both sockets/ and any
 * controller that needs to push real-time events to specific users.
 */
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
