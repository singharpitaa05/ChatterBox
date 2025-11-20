// MESSAGE CONTROLLERS

import { getUserSocketId } from '../config/socket.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// @desc    Send a message
// @route   POST /api/messages/send
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text' } = req.body;
    const senderId = req.user._id;

    // Validate input
    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver ID and content are required' });
    }

    // Don't allow sending messages to yourself
    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }

    // Find or create conversation between sender and receiver
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Create new message
    const message = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      content,
      messageType,
      status: 'sent',
    });

    // Update conversation's lastMessage
    conversation.lastMessage = message._id;
    await conversation.save();

    // Populate sender info for response
    await message.populate('sender', 'username avatar');

    // Emit socket event to receiver if they're online
    const io = req.app.get('io'); // Get io instance from app
    const receiverSocketId = getUserSocketId(receiverId);

    if (receiverSocketId) {
      // Emit new message to receiver
      io.to(receiverSocketId).emit('new_message', message);

      // Update message status to delivered
      message.status = 'delivered';
      await message.save();
    }

    // Return message to sender
    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify user is part of this conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all messages for this conversation
    const messages = await Message.find({ conversationId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 }); // Sort by oldest first

    res.status(200).json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};

// @desc    Mark messages as seen
// @route   PUT /api/messages/seen/:conversationId
// @access  Private
const markMessagesAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify user is part of this conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Update all messages in this conversation that were sent by the other user
    // and have status 'sent' or 'delivered' to 'seen'
    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId }, // Messages not sent by current user
        status: { $in: ['sent', 'delivered'] },
      },
      { status: 'seen' }
    );

    // Emit socket event to other participant
    const io = req.app.get('io');
    const otherParticipantId = conversation.participants.find(
      (p) => p.toString() !== userId.toString()
    );
    const otherSocketId = getUserSocketId(otherParticipantId.toString());

    if (otherSocketId) {
      io.to(otherSocketId).emit('messages_seen', {
        conversationId,
        seenBy: userId,
      });
    }

    res.status(200).json({ message: 'Messages marked as seen' });
  } catch (error) {
    console.error('Mark messages as seen error:', error);
    res.status(500).json({ message: 'Server error marking messages as seen' });
  }
};

export { getMessages, markMessagesAsSeen, sendMessage };
