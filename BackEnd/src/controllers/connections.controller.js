const ConnectionRequest = require('../models/ConnectionRequest.model');
const connectionService = require('../services/connection.service');
const { getSocketId } = require('../services/socket.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// ─── POST /api/connections/request ─────────────────────────────────────────
const sendRequest = asyncHandler(async (req, res) => {
  const { receiverId, introMessage } = req.body;
  const senderId = req.user.id;

  if (senderId === receiverId) {
    throw new ApiError(400, 'You cannot send a connection request to yourself');
  }

  // Check if a request already exists (either direction)
  const existingRequest = await ConnectionRequest.findOne({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId },
    ],
  });

  if (existingRequest) {
    throw new ApiError(400, `A connection request already exists (Status: ${existingRequest.status})`);
  }

  const request = await ConnectionRequest.create({
    sender: senderId,
    receiver: receiverId,
    introMessage: introMessage || '',
  });

  const populatedRequest = await ConnectionRequest.findById(request._id)
    .populate('sender', 'fullName email city')
    .populate('receiver', 'fullName email city');

  // Push notification to receiver if they are online
  const io = req.app.get('io');
  if (io) {
    const receiverSocketId = getSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newConnectionRequest', populatedRequest);
    }
  }

  res.status(201).json({ success: true, request: populatedRequest });
});

// ─── GET /api/connections/incoming ─────────────────────────────────────────
const getIncomingRequests = asyncHandler(async (req, res) => {
  const requests = await ConnectionRequest.find({ receiver: req.user.id, status: 'pending' })
    .populate('sender', 'fullName email city bloodGroup isOrganDonor')
    .sort({ createdAt: -1 });

  res.json({ success: true, requests });
});

// ─── GET /api/connections/outgoing ─────────────────────────────────────────
const getOutgoingRequests = asyncHandler(async (req, res) => {
  const requests = await ConnectionRequest.find({ sender: req.user.id })
    .populate('receiver', 'fullName email city bloodGroup isOrganDonor')
    .sort({ createdAt: -1 });

  res.json({ success: true, requests });
});

// ─── PUT /api/connections/:id/accept ───────────────────────────────────────
const acceptRequest = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  
  // Uses the atomic service to create the conversation seamlessly
  const { request, conversation } = await connectionService.acceptConnectionRequest(requestId, req.user.id);

  // Notify sender that their request was accepted
  const io = req.app.get('io');
  if (io) {
    const senderSocketId = getSocketId(request.sender);
    if (senderSocketId) {
      io.to(senderSocketId).emit('requestAccepted', { request, conversation });
    }
  }

  res.json({ success: true, message: 'Request accepted', conversation });
});

// ─── PUT /api/connections/:id/reject ───────────────────────────────────────
const rejectRequest = asyncHandler(async (req, res) => {
  const request = await ConnectionRequest.findOneAndUpdate(
    { _id: req.params.id, receiver: req.user.id, status: 'pending' },
    { status: 'rejected' },
    { new: true }
  );

  if (!request) {
    throw new ApiError(404, 'Pending request not found');
  }

  res.json({ success: true, message: 'Request rejected', request });
});

module.exports = {
  sendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  acceptRequest,
  rejectRequest,
};
