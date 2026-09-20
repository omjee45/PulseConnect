const Message = require('../models/Message.model');
const Conversation = require('../models/Conversation.model');
const { addUser, removeUser, getSocketId, getOnlineUserIds } = require('../services/socket.service');

function registerChatHandlers(io, socket) {
  const userId = socket.userId;

  addUser(userId, socket.id);
  io.emit('onlineUsers', getOnlineUserIds());
  console.log(`✅ Socket connected: userId=${userId} socketId=${socket.id}`);

  socket.on('sendMessage', async ({ conversationId, text, receiverId }) => {
    try {
      if (!conversationId || !text?.trim() || !receiverId) {
        return socket.emit('messageError', {
          error: 'conversationId, text, and receiverId are required',
        });
      }

      // Verify conversation exists and this user is a participant
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });

      if (!conversation) {
        return socket.emit('messageError', {
          error: 'Conversation not found or access denied',
        });
      }

      // Persist message
      const message = await Message.create({ conversationId, sender: userId, text: text.trim() });

      // Update conversation's last-message preview
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: text.trim(),
        lastMessageAt: new Date(),
      });

      const populated = await Message.findById(message._id).populate('sender', 'fullName email');

      // Deliver to receiver if online
      const receiverSocketId = getSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', populated);
      }

      // Echo back to sender (confirm delivery)
      socket.emit('receiveMessage', populated);
    } catch (err) {
      console.error('sendMessage error:', err.message);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // ─── typing indicators ─────────────────────────────────────────────────
  socket.on('typing', ({ conversationId, receiverId }) => {
    const receiverSocketId = getSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userTyping', { conversationId, userId });
    }
  });

  socket.on('stopTyping', ({ conversationId, receiverId }) => {
    const receiverSocketId = getSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userStopTyping', { conversationId, userId });
    }
  });

  // ─── disconnect ────────────────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    removeUser(userId);
    io.emit('onlineUsers', getOnlineUserIds());
    console.log(`❌ Socket disconnected: userId=${userId} reason=${reason}`);
  });
}

module.exports = registerChatHandlers;
