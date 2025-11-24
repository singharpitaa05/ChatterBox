// JWT TOKEN GENERATION UTILITY

import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Load environment variables from .env file
dotenv.config();

// Generate JWT token and set it in HTTP-only cookie
const generateToken = (res, userId) => {
  // Create JWT token with user ID as payload
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  // Set token in HTTP-only cookie for security
  res.cookie('jwt', token, {
    httpOnly: true, // Prevents XSS attacks (client-side JS cannot access)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', 
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  return token;
};

export default generateToken;