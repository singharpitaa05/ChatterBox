// TOAST NOTIFICATION COMPONENT

import { MessageSquare, X } from 'lucide-react';
import { useEffect } from 'react';

const ToastNotification = ({ notification, onClose }) => {
  // Auto-close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 max-w-sm w-full">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className="shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageSquare size={20} className="text-blue-600" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {notification.title}
              </p>
              <button
                onClick={onClose}
                className="ml-2 text-gray-400 hover:text-gray-600 transition"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {notification.message}
            </p>
            {notification.time && (
              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
            )}
          </div>

          {/* Avatar (if provided) */}
          {notification.avatar && (
            <img
              src={notification.avatar}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;