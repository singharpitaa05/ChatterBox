// CHAT MESSAGE COMPONENT WITH MEDIA SUPPORT

import { Check, CheckCheck, Download, FileText } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ImagePreviewModal from './ImagePreviewModal';

const ChatMessage = ({ message }) => {
  const { user } = useAuth();
  const isOwnMessage = message.sender._id === user._id;
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status icon
  const getStatusIcon = () => {
    if (!isOwnMessage) return null;

    if (message.status === 'seen') {
      return <CheckCheck size={16} className="text-blue-500" />;
    } else if (message.status === 'delivered') {
      return <CheckCheck size={16} className="text-gray-400" />;
    } else {
      return <Check size={16} className="text-gray-400" />;
    }
  };

  // Check if message contains an image URL
  const isImageMessage = message.messageType === 'image' || 
    (message.content && (
      message.content.includes('res.cloudinary.com') ||
      message.content.match(/\.(jpeg|jpg|gif|png|webp)$/i)
    ));

  // Check if message is a file
  const isFileMessage = message.messageType === 'file';

  // Extract file name from URL or content
  const getFileName = () => {
    if (message.fileName) return message.fileName;
    
    try {
      const url = message.content;
      const parts = url.split('/');
      return parts[parts.length - 1] || 'file';
    } catch {
      return 'file';
    }
  };

  // Handle file download
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = message.content;
    link.download = getFileName();
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md`}>
          {/* Avatar for received messages */}
          {!isOwnMessage && (
            <img
              src={message.sender.avatar}
              alt={message.sender.username}
              className="w-8 h-8 rounded-full shrink-0"
            />
          )}

          {/* Message bubble */}
          <div
            className={`rounded-2xl ${
              isOwnMessage
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-gray-200 text-gray-800 rounded-bl-none'
            } ${isImageMessage || isFileMessage ? 'p-2' : 'px-4 py-2'}`}
          >
            {/* Image message */}
            {isImageMessage ? (
              <div>
                <img
                  src={message.content}
                  alt="Shared image"
                  className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition"
                  style={{ maxHeight: '300px', objectFit: 'cover' }}
                  onClick={() => setShowImagePreview(true)}
                />
                {/* Timestamp and status for images */}
                <div className={`flex items-center justify-end space-x-1 mt-1 px-2`}>
                  <span
                    className={`text-xs ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </span>
                  {getStatusIcon()}
                </div>
              </div>
            ) : isFileMessage ? (
              /* File message */
              <div className="px-2 py-2">
                <div
                  onClick={handleDownload}
                  className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition"
                >
                  <div
                    className={`p-3 rounded-lg ${
                      isOwnMessage ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <FileText size={24} className={isOwnMessage ? 'text-white' : 'text-gray-700'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isOwnMessage ? 'text-white' : 'text-gray-800'}`}>
                      {getFileName()}
                    </p>
                    <p className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                      Click to download
                    </p>
                  </div>
                  <Download size={20} className={isOwnMessage ? 'text-white' : 'text-gray-600'} />
                </div>
                {/* Timestamp and status for files */}
                <div className={`flex items-center justify-end space-x-1 mt-2`}>
                  <span
                    className={`text-xs ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </span>
                  {getStatusIcon()}
                </div>
              </div>
            ) : (
              /* Text message */
              <>
                <p className="Wrap-break-words whitespace-pre-wrap">{message.content}</p>
                {/* Timestamp and status */}
                <div className={`flex items-center justify-end space-x-1 mt-1`}>
                  <span
                    className={`text-xs ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </span>
                  {getStatusIcon()}
                </div>
              </>
            )}
          </div>

          {/* Avatar for sent messages */}
          {isOwnMessage && (
            <img
              src={message.sender.avatar}
              alt={message.sender.username}
              className="w-8 h-8 rounded-full shrink-0"
            />
          )}
        </div>
      </div>

      {/* Image preview modal */}
      {showImagePreview && (
        <ImagePreviewModal
          imageUrl={message.content}
          onClose={() => setShowImagePreview(false)}
        />
      )}
    </>
  );
};

export default ChatMessage;