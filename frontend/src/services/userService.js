// USER SERVICE 

import api from '../config/axios';

// Get user profile by ID
export const getUserProfile = async (userId) => {
  try {
    const { data } = await api.get(`/users/profile/${userId}`);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch user profile',
    };
  }
};

// Update current user profile
export const updateUserProfile = async (profileData) => {
  try {
    const { data } = await api.put('/users/profile', profileData);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update profile',
    };
  }
};

// Search users
export const searchUsers = async (query) => {
  try {
    const { data } = await api.get(`/users/search?query=${query}`);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to search users',
    };
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    const { data } = await api.get('/users');
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch users',
    };
  }
};

// Upload avatar to Cloudinary
export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const { data } = await api.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to upload avatar',
    };
  }
};

// Delete avatar from Cloudinary
export const deleteAvatar = async (publicId) => {
  try {
    const { data } = await api.delete(`/upload/avatar/${publicId}`);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete avatar',
    };
  }
};