const mongoose = require('mongoose');
const ConnectionRequest = require('../models/ConnectionRequest.model');
const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const ApiError = require('../utils/ApiError');

/**
 * Service to handle accepting a connection request.
 * This is the critical ATOMIC flow that fixes the old "fragmented connection" bug.
 * 
 * 1. Mark request as 'accepted'
 * 2. Create a new Conversation
 * 3. Add the introMessage as the first Message (if it exists)
 * 4. Return the populated conversation
 * 
 * All done in a single database transaction so we never end up with half-created states.
 */
async function acceptConnectionRequest(requestId, receiverId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const request = await ConnectionRequest.findById(requestId).session(session);

    if (!request) {
      throw new ApiError(404, 'Connection request not found');
    }

    if (request.receiver.toString() !== receiverId) {
      throw new ApiError(403, 'You are not authorized to accept this request');
    }

    if (request.status !== 'pending') {
      throw new ApiError(400, `Request is already ${request.status}`);
    }

    // 1. Update status
    request.status = 'accepted';
    await request.save({ session });

    // 2. Check if a conversation already exists (just in case)
    let conversation = await Conversation.findOne({
      participants: { $all: [request.sender, request.receiver], $size: 2 },
    }).session(session);

    // 3. Create conversation if it doesn't exist
    if (!conversation) {
      conversation = new Conversation({
        participants: [request.sender, request.receiver],
      });
    }

    // 4. Add intro message to chat history if it exists
    if (request.introMessage) {
      const message = new Message({
        conversationId: conversation._id,
        sender: request.sender,
        text: request.introMessage,
      });
      await message.save({ session });
      
      conversation.lastMessage = request.introMessage;
      conversation.lastMessageAt = new Date();
    } else {
      conversation.lastMessage = "Connection accepted";
      conversation.lastMessageAt = new Date();
    }
    
    await conversation.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Return the populated conversation to send back to the client
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'fullName email role');
      
    return { request, conversation: populatedConversation };

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

module.exports = { acceptConnectionRequest };
