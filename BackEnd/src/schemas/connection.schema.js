const { z } = require('zod');

const sendRequestSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  introMessage: z.string().max(300, 'Intro message cannot exceed 300 characters').optional(),
});

module.exports = { sendRequestSchema };
