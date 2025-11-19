// PROFILE EDIT MODAL COMPONENT

import { Camera, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, uploadAvatar } from '../services/userService';

const ProfileEditModal = ({ isOpen, onClose }) => {
  const { user, checkAuth } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatar: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data when user or modal opens
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
      setAvatarPreview(user.avatar || '');
      setAvatarFile(null);
      setError('');
    }
  }, [user, isOpen]);

  // Handle text input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      setAvatarFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.username || formData.username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setLoading(true);

    try {
      let avatarUrl = formData.avatar;

      // Upload avatar if a new file is selected
      if (avatarFile) {
        const uploadResult = await uploadAvatar(avatarFile);
        if (uploadResult.success) {
          // Use Cloudinary URL directly (no need to construct)
          avatarUrl = uploadResult.data.avatar;
        } else {
          setError(uploadResult.error);
          setLoading(false);
          return;
        }
      }

      // Update profile with new data
      const result = await updateUserProfile({
        username: formData.username.trim(),
        bio: formData.bio.trim(),
        avatar: avatarUrl,
      });

      if (result.success) {
        // Refresh user data in context
        await checkAuth();
        // Close modal
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={avatarPreview || 'https://via.placeholder.com/150'}
                  alt="Avatar Preview"
                  className="w-28 h-28 rounded-full object-cover border-4 border-blue-500"
                />
                <label
                  htmlFor="avatar-edit-upload"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition"
                >
                  <Camera size={18} />
                </label>
                <input
                  type="file"
                  id="avatar-edit-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={loading}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">Click camera icon to change photo</p>
            </div>

            {/* Username Input */}
            <div>
              <label htmlFor="edit-username" className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                id="edit-username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                placeholder="Your username"
              />
            </div>

            {/* Bio Input */}
            <div>
              <label htmlFor="edit-bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="edit-bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={loading}
                rows="3"
                maxLength="150"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none disabled:bg-gray-100"
                placeholder="Tell us about yourself"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/150 characters</p>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;