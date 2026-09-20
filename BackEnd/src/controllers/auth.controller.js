const User = require('../models/User.model');
const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');


// Cookie options for the JWT token
const isProd = process.env.NODE_ENV === 'production' || (process.env.BACKEND_URL && process.env.BACKEND_URL.includes('onrender'));

const getCookieOptions = () => ({
  httpOnly: true,                               
  secure: isProd,                         
  sameSite: isProd ? 'none' : 'strict',  
  maxAge: 7 * 24 * 60 * 60 * 1000,                                      
});

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, DOB } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const hashedPassword = await authService.hashPassword(password);

  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    role: role || 'donor',
    DOB: new Date(DOB),
  });

  const token = authService.signToken({ id: user._id, role: user.role });
  res.cookie('token', token, getCookieOptions());

  return res.status(201).json({
    success: true,
    message: 'Account created successfully',
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      profileCompleted: user.profileCompleted,
    },
  });
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Deliberately vague error ("Invalid email or password") to prevent user enumeration
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await authService.comparePassword(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = authService.signToken({ id: user._id, role: user.role });
  res.cookie('token', token, getCookieOptions());

  return res.json({
    success: true,
    message: 'Logged in successfully',
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      profileCompleted: user.profileCompleted,
    },
  });
});

// ─── POST /api/auth/logout ─────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  // getCookieOptions() includes maxAge, which is deprecated for clearCookie.
  // We omit it when clearing the cookie.
  const { maxAge, ...clearOptions } = getCookieOptions();
  res.clearCookie('token', clearOptions);
  return res.json({ success: true, message: 'Logged out successfully' });
});

// ─── GET /api/auth/me ──────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return res.json({
    success: true,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      profileCompleted: user.profileCompleted,
    },
  });
});

module.exports = { register, login, logout, getMe };
