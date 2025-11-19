// UPLOAD ROUTES FOR AVATAR IMAGE HANDLING

import express from 'express';
import upload from '../config/multer.js';
import { deleteAvatar, uploadAvatar } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Upload avatar (protected route)
// 'avatar' is the field name expected in the form data
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

// Delete avatar (protected route)
router.delete('/avatar/:publicId', protect, deleteAvatar);

export default router;