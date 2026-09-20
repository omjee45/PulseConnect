const express = require('express');
const router = express.Router();

const conversationsController = require('../controllers/conversations.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', conversationsController.getConversations);
router.get('/:id/messages', conversationsController.getMessages);

module.exports = router;
