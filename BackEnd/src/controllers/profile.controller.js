const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendAdminApprovalEmail } = require('../services/email.service');

// ─── GET /api/profile/:id ──────────────────────────────────────────────────
const getProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // TODO: Add privacy rules — e.g. only return full profile if they are connected,
  // or return a sanitized version for public viewing.
  // For now, return basic public info (exclude password/sensitive fields).
  const profile = await User.findById(id).select('-password');
  
  if (!profile) {
    throw new ApiError(404, 'User profile not found');
  }

  res.json({ success: true, profile });
});

// ─── PUT /api/profile ──────────────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updates = req.body;

  // Format date correctly if provided
  if (updates.lastDonationDate) {
    updates.lastDonationDate = new Date(updates.lastDonationDate);
  }

  // If location is provided, ensure the type is "Point"
  if (updates.location && updates.location.coordinates) {
    updates.location.type = 'Point';
  }

  // If they filled out key fields, mark profileCompleted as true
  if (updates.bloodGroup && updates.state && updates.city) {
    updates.profileCompleted = true;
  }

  const currentUser = await User.findById(userId);
  if (!currentUser) {
    throw new ApiError(404, 'User not found');
  }

  // Handle role and verification logic
  const isDonating = updates.isAvailableForBloodDonation === true || updates.isOrganDonor === true;
  let needsApproval = false;

  if (isDonating) {
    if (currentUser.isVerified === true) {
      // Already verified previously — safe to switch back to donor immediately, no friction
      updates.role = 'donor';
    } else {
      // Never verified — do NOT set role to 'donor' yet. Stay as 'recipient' / pending.
      updates.role = 'recipient';
      
      // Only fire the verification email if this is an explicit transition from off -> on
      const becomingBloodDonor = updates.isAvailableForBloodDonation === true && !currentUser.isAvailableForBloodDonation;
      const becomingOrganDonor = updates.isOrganDonor === true && !currentUser.isOrganDonor;
      if (becomingBloodDonor || becomingOrganDonor) {
        needsApproval = true;
      }
    }
  } else {
    // Opting out — always safe to set back to recipient, regardless of verification history
    updates.role = 'recipient';
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  // Trigger admin email only on explicit transition to donor status
  if (needsApproval) {
    // We do not await this, so it runs asynchronously in the background
    // Any errors inside it are caught internally and won't crash this request
    sendAdminApprovalEmail(updatedUser);
  }

  res.json({ success: true, message: 'Profile updated successfully', profile: updatedUser });
});

module.exports = { getProfile, updateProfile };
