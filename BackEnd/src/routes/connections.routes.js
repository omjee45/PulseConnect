const express = require('express');
const router = express.Router();

const connectionsController = require('../controllers/connections.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { sendRequestSchema } = require('../schemas/connection.schema');

router.use(authMiddleware);

router.post('/request', validate(sendRequestSchema), connectionsController.sendRequest);
router.get('/incoming', connectionsController.getIncomingRequests);
router.get('/outgoing', connectionsController.getOutgoingRequests);
router.put('/:id/accept', connectionsController.acceptRequest);
router.put('/:id/reject', connectionsController.rejectRequest);

module.exports = router;
