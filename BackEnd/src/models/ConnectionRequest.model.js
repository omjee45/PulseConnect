const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    introMessage: {
      type: String,
      trim: true,
      maxlength: [300, 'Intro message cannot exceed 300 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// Prevent a user from sending duplicate requests to the same person
connectionRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema);
