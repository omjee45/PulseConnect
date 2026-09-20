const express = require('express');
const router = express.Router();

const profileController = require('../controllers/profile.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { updateProfileSchema } = require('../schemas/profile.schema');

// All profile routes require authentication
router.use(authMiddleware);

router.get('/:id', profileController.getProfile);
router.put('/', validate(updateProfileSchema), profileController.updateProfile);

module.exports = router;
