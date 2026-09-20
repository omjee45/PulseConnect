const express = require('express');
const router = express.Router();

const donorsController = require('../controllers/donors.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public route - anyone can search for donors
router.get('/nearby', donorsController.getNearbyDonors);

module.exports = router;
