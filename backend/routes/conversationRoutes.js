// CONVERSATION ROUTES

import express from 'express';
import {
    createOrGetConversation,
    deleteConversation,
    getConversations,
} from '../controllers/conversationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected (require authentication)
router.get('/', protect, getConversations); // Get all conversations for user
router.post('/create', protect, createOrGetConversation); // Create or get conversation
router.delete('/:conversationId', protect, deleteConversation); // Delete conversation

export default router;