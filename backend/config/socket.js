// SOCKET CONFIGURATION

import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Store online users (userId -> socketId mapping)
const onlineUsers = new Map();

// Initialize Socket.io server
const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Socket.io authentication middleware
  io.use(async (socket, next) => {
    try {
      // Get token from handshake auth or query
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user to socket
      socket.userId = user._id.toString();
      socket.user = user;

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.username} (${socket.userId})`);

    // Add user to online users map
    onlineUsers.set(socket.userId, socket.id);

    // Update user status to online in database
    User.findByIdAndUpdate(socket.userId, { status: 'online' }).catch((err) =>
      console.error('Error updating user status:', err)
    );

    // Emit user online event to all connected clients
    io.emit('user_online', { userId: socket.userId });

    // Send list of online users to the newly connected user
    socket.emit('online_users', Array.from(onlineUsers.keys()));

    // Handle user disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.username} (${socket.userId})`);

      // Remove user from online users map
      onlineUsers.delete(socket.userId);

      // Update user status to offline and set lastSeen
      User.findByIdAndUpdate(socket.userId, {
        status: 'offline',
        lastSeen: Date.now(),
      }).catch((err) => console.error('Error updating user status:', err));

      // Emit user offline event to all connected clients
      io.emit('user_offline', { userId: socket.userId });
    });

    // Handle typing indicator start
    socket.on('typing_start', ({ conversationId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          conversationId,
          userId: socket.userId,
          username: socket.user.username,
        });
      }
    });

    // Handle typing indicator stop
    socket.on('typing_stop', ({ conversationId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_stopped_typing', {
          conversationId,
          userId: socket.userId,
        });
      }
    });

    // Handle sending messages (will be implemented in controller)
    // The actual message sending logic is in the message controller
    // Socket events for message delivery and seen status will be emitted from there
  });

  return io;
};

// Get socket ID for a specific user
const getUserSocketId = (userId) => {
  return onlineUsers.get(userId);
};

// Get all online user IDs
const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

export { getOnlineUsers, getUserSocketId, initializeSocket };

