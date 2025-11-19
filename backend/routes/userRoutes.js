// USER ROUTES

import express from 'express';
import {
    getAllUsers,
    getUserProfile,
    searchUsers,
    updateUserProfile,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected (require authentication)
router.get('/search', protect, searchUsers); // Search users
router.get('/', protect, getAllUsers); // Get all users
router.get('/profile/:userId', protect, getUserProfile); // Get user profile by ID
router.put('/profile', protect, updateUserProfile); // Update own profile

export default router;