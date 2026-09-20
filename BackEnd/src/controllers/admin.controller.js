const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// ─── GET /api/admin/users/unverified ───────────────────────────────────────
const getUnverifiedUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ 
    isVerified: false, 
    role: { $in: ['donor', 'recipient'] } 
  })
    .select('-password')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: users.length, users });
});

// ─── PUT /api/admin/users/:id/verify ───────────────────────────────────────
const verifyUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isVerified: true },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({ success: true, message: 'User verified successfully', user });
});


const rejectUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({ success: true, message: 'User rejected and account deleted' });
});

// ─── GET /api/admin/donor-action (Email Action) ─────────────────────────────
const handleDonorAction = asyncHandler(async (req, res) => {
  const { token } = req.query;

  // Basic HTML template for responses
  const htmlResponse = (title, message, color = '#334155') => `
    <html>
      <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f8fafc;">
        <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; max-width: 400px;">
          <h2 style="color: ${color}; margin-top: 0;">${title}</h2>
          <p style="color: #64748b; font-size: 16px;">${message}</p>
        </div>
      </body>
    </html>
  `;

  if (!token) {
    return res.status(400).send(htmlResponse('Missing Token', 'No action token provided in the URL.', '#ef4444'));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ADMIN_ACTION_SECRET);
  } catch (err) {
    return res.status(400).send(htmlResponse('Invalid Link', 'This link is invalid or has expired. Please check your admin dashboard.', '#ef4444'));
  }

  const { donorId, action } = decoded;
  const user = await User.findById(donorId);

  if (!user) {
    return res.status(404).send(htmlResponse('Not Found', 'The donor associated with this action could not be found.', '#ef4444'));
  }

  // Idempotency and conflict checks
  if (action === 'approve' && user.isVerified === true) {
    return res.send(htmlResponse('Already Verified', 'This donor has already been approved and is verified.', '#3b82f6'));
  }
  
  if (action === 'reject') {
    if (user.isVerified === true) {
      return res.status(409).send(htmlResponse('Conflict', 'Cannot reject an already verified user. Please use the admin dashboard to manually revoke verification.', '#f59e0b'));
    }
    if (user.isVerified === false) {
      // It's possible they are already rejected (or just pending), so rejecting again is a safe no-op.
      // Ensure they stay a recipient.
      user.role = 'recipient';
      await user.save();
      return res.send(htmlResponse('Request Rejected', 'The donor request has been rejected (status kept as pending).', '#ef4444'));
    }
  }

  // Apply action
  if (action === 'approve') {
    user.isVerified = true;
    user.role = 'donor';
    await user.save();
    return res.send(htmlResponse('Donor Approved ✅', 'The donor has been successfully verified and will now appear in public searches.', '#22c55e'));
  }

  // Fallback
  return res.status(400).send(htmlResponse('Unknown Action', 'Unrecognized action.', '#ef4444'));
});

module.exports = { getUnverifiedUsers, verifyUser, rejectUser, handleDonorAction };
