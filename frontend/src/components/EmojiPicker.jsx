// EMOJI PICKER COMPONENT

import { Smile } from 'lucide-react';
import { useState } from 'react';

const EmojiPicker = ({ onEmojiSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Common emojis categorized
  const emojiCategories = {
    smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
    gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '🙏', '💪', '🦾'],
    hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
    symbols: ['✨', '⭐', '🌟', '💫', '🔥', '💯', '✅', '❌', '⚠️', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉'],
  };

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Emoji button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-blue-600 transition"
        title="Add emoji"
      >
        <Smile size={20} />
      </button>

      {/* Emoji picker dropdown */}
      {isOpen && (
        <>
          {/* Backdrop to close picker */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Emoji picker panel */}
          <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-80 max-h-96 overflow-y-auto z-20">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Choose an emoji</h3>

            {/* Smileys */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Smileys & People</p>
              <div className="grid grid-cols-8 gap-2">
                {emojiCategories.smileys.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-2xl hover:bg-gray-100 rounded p-1 transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Gestures */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Gestures</p>
              <div className="grid grid-cols-8 gap-2">
                {emojiCategories.gestures.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-2xl hover:bg-gray-100 rounded p-1 transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Hearts */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Hearts</p>
              <div className="grid grid-cols-8 gap-2">
                {emojiCategories.hearts.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-2xl hover:bg-gray-100 rounded p-1 transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Symbols */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Symbols</p>
              <div className="grid grid-cols-8 gap-2">
                {emojiCategories.symbols.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-2xl hover:bg-gray-100 rounded p-1 transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmojiPicker;