const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['donor', 'recipient', 'admin'],
      default: 'donor',
    },
    phone: { type: String, trim: true },
    isPhonePublic: { type: Boolean, default: false }, // donor controls if phone is visible
    DOB: { type: Date },
    age: { type: Number, min: [18, 'Must be at least 18 years old'] },
    weight: { type: Number },
    medicalConditions: { type: String },
    emergencyContact: { type: String },

    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    isAvailableForBloodDonation: { type: Boolean, default: true },
    lastDonationDate: { type: Date },

    isOrganDonor: { type: Boolean, default: false },
    organsDonating: [
      {
        type: String,
        enum: ['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Eyes'],
      },
    ],

    state: { type: String },
    city: { type: String },
    pincode: { type: String },

    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },

    isVerified: { type: Boolean, default: false },
    profileCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' }, { sparse: true });

module.exports = mongoose.model('User', userSchema);
