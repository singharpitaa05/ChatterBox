// CONVERSATION CONTROLLERS

import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Get all conversations for current user
// @route   GET /api/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all conversations where user is a participant
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'username avatar status lastSeen')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username',
        },
      })
      .sort({ updatedAt: -1 }); // Sort by most recent

    // For each conversation, get unread message count
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        // Count unread messages (messages not sent by current user with status not 'seen')
        const unreadCount = await Message.countDocuments({
          conversationId: conversation._id,
          sender: { $ne: userId },
          status: { $ne: 'seen' },
        });

        // Get the other participant (not current user)
        const otherParticipant = conversation.participants.find(
          (participant) => participant._id.toString() !== userId.toString()
        );

        return {
          _id: conversation._id,
          otherParticipant,
          lastMessage: conversation.lastMessage,
          unreadCount,
          updatedAt: conversation.updatedAt,
        };
      })
    );

    res.status(200).json(conversationsWithUnread);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
};

// @desc    Get or create conversation with a user
// @route   POST /api/conversations/create
// @access  Private
const createOrGetConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    // Don't allow conversation with yourself
    if (userId.toString() === participantId) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] },
    })
      .populate('participants', 'username avatar status lastSeen')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username',
        },
      });

    // If conversation doesn't exist, create it
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, participantId],
      });

      // Populate the newly created conversation
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'username avatar status lastSeen')
        .populate({
          path: 'lastMessage',
          populate: {
            path: 'sender',
            select: 'username',
          },
        });
    }

    // Get unread message count
    const unreadCount = await Message.countDocuments({
      conversationId: conversation._id,
      sender: { $ne: userId },
      status: { $ne: 'seen' },
    });

    // Get the other participant
    const otherParticipant = conversation.participants.find(
      (p) => p._id.toString() !== userId.toString()
    );

    res.status(200).json({
      _id: conversation._id,
      otherParticipant,
      lastMessage: conversation.lastMessage,
      unreadCount,
      updatedAt: conversation.updatedAt,
    });
  } catch (error) {
    console.error('Create/get conversation error:', error);
    res.status(500).json({ message: 'Server error creating conversation' });
  }
};

// @desc    Delete a conversation
// @route   DELETE /api/conversations/:conversationId
// @access  Private
const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Find conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Verify user is a participant
    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversationId });

    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId);

    res.status(200).json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ message: 'Server error deleting conversation' });
  }
};

export { createOrGetConversation, deleteConversation, getConversations };

