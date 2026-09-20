const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// ─── GET /api/conversations ────────────────────────────────────────────────
const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user.id })
    .populate('participants', 'fullName email city')
    .sort({ lastMessageAt: -1 });

  res.json({ success: true, conversations });
});

// ─── GET /api/conversations/:id/messages ───────────────────────────────────
const getMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Ensure user is part of the conversation
  const conversation = await Conversation.findOne({ _id: id, participants: req.user.id });
  if (!conversation) {
    throw new ApiError(403, 'Access denied or conversation not found');
  }

  const messages = await Message.find({ conversationId: id })
    .populate('sender', 'fullName')
    .sort({ createdAt: 1 });

  res.json({ success: true, messages });
});

module.exports = { getConversations, getMessages };
