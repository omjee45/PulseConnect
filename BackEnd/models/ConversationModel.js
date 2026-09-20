const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    lastMessage: {
        type: String,
        default: ""
    }
}, { timestamps: true });


conversationSchema.index({ participants: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);
