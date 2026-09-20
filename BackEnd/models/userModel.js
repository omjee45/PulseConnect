const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true
    },

    phone: {
        type: String,
    },
    DOB: {
        type: Date,
        required: true
    },

    role: {
        type: String,
        enum: ["donor", "recipient", "admin"],

        default: "donor"
    },

    bloodGroup: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    },

    lastDonationDate: {
        type: Date
    },

    isAvailableForBloodDonation: {
        type: Boolean,
        default: true
    },
    isOrganDonor: {
        type: Boolean,
        default: false
    },

    organsDonating: [{
        type: String,
        enum: ["Kidney", "Liver", "Heart", "Lungs", "Pancreas", "Eyes"]
    }],

    state: String,
    city: String,
    pincode: String,

    
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],   
            default: [0, 0]
        }
    },

    age: {
        type: Number,
        min: 18
    },

    weight: Number,
    medicalConditions: String,
    emergencyContact: String,
    isVerified: {
        type: Boolean,
        default: false
    },

    profileCompleted: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });


userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model("User", userSchema);