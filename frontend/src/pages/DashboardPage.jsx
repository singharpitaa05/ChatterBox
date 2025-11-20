// DASHBOARD PAGE - PHASE 3 WITH REAL-TIME CHAT

import { LogOut, MessageSquare, Settings, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';
import ConversationItem from '../components/ConversationItem';
import ProfileEditModal from '../components/ProfileEditModal';
import UserSearch from '../components/UserSearch';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { createOrGetConversation, getConversations } from '../services/conversationService';
import { getAllUsers } from '../services/userService';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'users'

  // Fetch conversations and users on component mount
  useEffect(() => {
    fetchConversations();
    fetchUsers();
  }, []);

  // Listen for new messages to update conversation list
  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (newMessage) => {
      // Refresh conversations to update last message and unread count
      fetchConversations();
    });

    return () => {
      socket.off('new_message');
    };
  }, [socket]);

  // Fetch all conversations
  const fetchConversations = async () => {
    setLoading(true);
    const result = await getConversations();
    if (result.success) {
      setConversations(result.data);
    }
    setLoading(false);
  };

  // Fetch all users
  const fetchUsers = async () => {
    const result = await getAllUsers();
    if (result.success) {
      setUsers(result.data);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Handle user selection from search or users list
  const handleUserSelect = async (selectedUser) => {
    // Create or get conversation with selected user
    const result = await createOrGetConversation(selectedUser._id);
    if (result.success) {
      setSelectedConversation(result.data);
      setActiveTab('chats'); // Switch to chats tab
      // Refresh conversations list
      fetchConversations();
    }
  };

  // Handle conversation selection
  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
  };

  // Handle back button (mobile)
  const handleBack = () => {
    setSelectedConversation(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className={`w-full md:w-80 bg-white border-r flex flex-col ${
        selectedConversation ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b bg-blue-600">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">ChatterBox</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="p-2 text-white hover:bg-blue-700 rounded-lg transition"
                title="Settings"
              >
                <Settings size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-white hover:bg-blue-700 rounded-lg transition"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* User Info */}
          <div
            className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition"
            onClick={() => setIsProfileModalOpen(true)}
          >
            <img
              src={user?.avatar}
              alt={user?.username}
              className="w-12 h-12 rounded-full object-cover border-2 border-white"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{user?.username}</p>
              <p className="text-sm text-white/80 truncate">{user?.bio}</p>
            </div>
            <div>
              <span className="inline-block w-3 h-3 bg-green-400 rounded-full"></span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b">
          <UserSearch onUserSelect={handleUserSelect} />
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 font-semibold transition ${
              activeTab === 'chats'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <MessageSquare size={18} />
            <span>Chats</span>
            {conversations.length > 0 && (
              <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {conversations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 font-semibold transition ${
              activeTab === 'users'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <Users size={18} />
            <span>Users</span>
          </button>
        </div>

        {/* Chat List / Users List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            // Loading state
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activeTab === 'chats' ? (
            // Chats Tab
            conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageSquare size={64} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Conversations Yet</h3>
                <p className="text-sm text-gray-500">
                  Search for users and start chatting!
                </p>
              </div>
            ) : (
              <div>
                {conversations.map((conversation) => (
                  <ConversationItem
                    key={conversation._id}
                    conversation={conversation}
                    isActive={selectedConversation?._id === conversation._id}
                    onClick={() => handleConversationSelect(conversation)}
                  />
                ))}
              </div>
            )
          ) : (
            // Users Tab
            <div>
              {users.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>No users found</p>
                </div>
              ) : (
                users.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => handleUserSelect(u)}
                    className="flex items-center space-x-3 p-4 cursor-pointer border-b hover:bg-gray-50 transition"
                  >
                    <div className="relative">
                      <img
                        src={u.avatar}
                        alt={u.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          onlineUsers.includes(u._id) ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      ></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{u.username}</p>
                      <p className="text-sm text-gray-500 truncate">{u.bio}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Chat Area */}
      <div className={`flex-1 flex flex-col bg-gray-50 ${
        selectedConversation ? 'flex' : 'hidden md:flex'
      }`}>
        {selectedConversation ? (
          // Chat Window
          <ChatWindow conversation={selectedConversation} onBack={handleBack} />
        ) : (
          // No Conversation Selected - Empty State
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquare size={80} className="mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Welcome to ChatterBox</h2>
            <p>Select a conversation or user to start chatting</p>
          </div>
        )}
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;