const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/requireRole.middleware');

// Public email-action route (authorized via JWT token in query)
router.get('/donor-action', adminController.handleDonorAction);

// All other admin routes require authentication AND 'admin' role
router.use(authMiddleware, requireRole('admin'));

router.get('/users/unverified', adminController.getUnverifiedUsers);
router.put('/users/:id/verify', adminController.verifyUser);
router.put('/users/:id/reject', adminController.rejectUser);

module.exports = router;
