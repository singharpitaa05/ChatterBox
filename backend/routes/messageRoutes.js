// MESSAGE ROUTES

import express from 'express';
import {
    getMessages,
    markMessagesAsSeen,
    sendMessage,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected (require authentication)
router.post('/send', protect, sendMessage); // Send a message
router.get('/:conversationId', protect, getMessages); // Get messages for a conversation
router.put('/seen/:conversationId', protect, markMessagesAsSeen); // Mark messages as seen

export default router;