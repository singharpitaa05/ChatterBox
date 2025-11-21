// CHAT INPUT COMPONENT WITH MEDIA & EMOJI SUPPORT

import { Image, Paperclip, Send, X } from 'lucide-react';
import { useRef, useState } from 'react';
import EmojiPicker from './EmojiPicker';

const ChatInput = ({ onSendMessage, onSendMedia, onTyping, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Handle input change
  const handleChange = (e) => {
    setMessage(e.target.value);
    
    // Trigger typing indicator if onTyping callback is provided
    if (onTyping && e.target.value.trim()) {
      onTyping();
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size should be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setFilePreview(null); // No preview for non-image files
    }
  };

  // Clear selected file
  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (disabled) return;

    // Send file if selected
    if (selectedFile && onSendMedia) {
      await onSendMedia(selectedFile, message.trim() || 'Sent a file');
      clearSelectedFile();
      setMessage('');
      return;
    }

    // Send text message
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  // Handle Enter key press (send message)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-white">
      {/* File preview */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {filePreview ? (
              <img
                src={filePreview}
                alt="Preview"
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                <Paperclip size={24} className="text-gray-500" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-800 truncate max-w-xs">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearSelectedFile}
            className="text-gray-500 hover:text-red-600 transition"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div className="flex items-center space-x-2">
        {/* Image upload button */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled || selectedFile}
          className="text-gray-600 hover:text-blue-600 transition disabled:opacity-50 p-2"
          title="Send image"
        >
          <Image size={20} />
        </button>

        {/* File upload button */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || selectedFile}
          className="text-gray-600 hover:text-blue-600 transition disabled:opacity-50 p-2"
          title="Send file"
        >
          <Paperclip size={20} />
        </button>

        {/* Emoji picker */}
        <EmojiPicker onEmojiSelect={handleEmojiSelect} />

        {/* Message input */}
        <input
          type="text"
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={selectedFile ? 'Add a caption (optional)...' : 'Type a message...'}
          disabled={disabled}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={(!message.trim() && !selectedFile) || disabled}
          className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;