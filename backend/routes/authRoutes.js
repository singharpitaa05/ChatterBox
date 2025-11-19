// AUTHENTICATION ROUTES

import express from 'express';
import { getMe, login, logout, signup } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes (require authentication)
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;