const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },
    introMessage: {
        type: String,
        trim: true,
        maxlength: 300,
        default: ""
    }
}, { timestamps: true });

connectionRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);
