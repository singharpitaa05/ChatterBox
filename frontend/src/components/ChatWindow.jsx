// CHAT WINDOW COMPONENT WITH MEDIA SUPPORT

import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getMessages, markMessagesAsSeen, sendMessage as sendMessageAPI } from '../services/messageService';
import { uploadAvatar } from '../services/userService';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

const ChatWindow = ({ conversation, onBack }) => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const isOnline = onlineUsers.includes(conversation.otherParticipant._id);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversation) {
      fetchMessages();
      // Mark messages as seen when conversation opens
      markMessagesAsSeen(conversation._id);
    }
  }, [conversation._id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('new_message', (newMessage) => {
      // Only add message if it belongs to current conversation
      if (newMessage.conversationId === conversation._id) {
        setMessages((prev) => [...prev, newMessage]);
        // Mark as seen immediately if conversation is open
        markMessagesAsSeen(conversation._id);
      }
    });

    // Listen for messages seen event
    socket.on('messages_seen', ({ conversationId }) => {
      if (conversationId === conversation._id) {
        // Update all messages status to seen
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender._id === user._id ? { ...msg, status: 'seen' } : msg
          )
        );
      }
    });

    // Listen for typing indicator
    socket.on('user_typing', ({ conversationId, username }) => {
      if (conversationId === conversation._id) {
        setIsTyping(true);
      }
    });

    socket.on('user_stopped_typing', ({ conversationId }) => {
      if (conversationId === conversation._id) {
        setIsTyping(false);
      }
    });

    // Cleanup listeners
    return () => {
      socket.off('new_message');
      socket.off('messages_seen');
      socket.off('user_typing');
      socket.off('user_stopped_typing');
    };
  }, [socket, conversation._id, user._id]);

  // Fetch messages from API
  const fetchMessages = async () => {
    setLoading(true);
    const result = await getMessages(conversation._id);
    if (result.success) {
      setMessages(result.data);
    }
    setLoading(false);
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle sending text message
  const handleSendMessage = async (content) => {
    setSending(true);

    const result = await sendMessageAPI(
      conversation.otherParticipant._id,
      content,
      'text'
    );

    if (result.success) {
      setMessages((prev) => [...prev, result.data]);
      scrollToBottom();
    }

    setSending(false);
  };

  // Handle sending media (images/files)
  const handleSendMedia = async (file, caption) => {
    setSending(true);

    try {
      // Upload file to Cloudinary using the avatar upload endpoint
      // (We're reusing this for simplicity - you could create a separate media upload endpoint)
      const uploadResult = await uploadAvatar(file);

      if (uploadResult.success) {
        // Determine message type based on file type
        const messageType = file.type.startsWith('image/') ? 'image' : 'file';

        // Send message with file URL
        const result = await sendMessageAPI(
          conversation.otherParticipant._id,
          uploadResult.data.avatar, // Cloudinary URL
          messageType
        );

        if (result.success) {
          setMessages((prev) => [...prev, result.data]);
          scrollToBottom();
        }
      } else {
        alert('Failed to upload file: ' + uploadResult.error);
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Failed to upload file');
    }

    setSending(false);
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!socket) return;

    // Emit typing start
    socket.emit('typing_start', {
      conversationId: conversation._id,
      receiverId: conversation.otherParticipant._id,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to emit typing stop after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', {
        conversationId: conversation._id,
        receiverId: conversation.otherParticipant._id,
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          {/* Back button (mobile) */}
          <button
            onClick={onBack}
            className="md:hidden text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={24} />
          </button>

          {/* Other participant info */}
          <div className="relative">
            <img
              src={conversation.otherParticipant.avatar}
              alt={conversation.otherParticipant.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-gray-800">
              {conversation.otherParticipant.username}
            </h2>
            <p className="text-sm text-gray-500">
              {isTyping ? 'typing...' : isOnline ? 'online' : 'offline'}
            </p>
          </div>
        </div>

        {/* More options button */}
        <button className="text-gray-600 hover:text-gray-800">
          <MoreVertical size={24} />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm mt-2">Send a message to start the conversation</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message._id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Chat input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onSendMedia={handleSendMedia}
        disabled={sending}
        onTyping={handleTyping}
      />
    </div>
  );
};

export default ChatWindow;