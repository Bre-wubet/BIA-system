import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useProfile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editing, setEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    role: '',
    department: '',
    phone: '',
    address: '',
    bio: '',
    avatar: '',
    timezone: 'America/New_York',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false,
      digest: 'daily'
    },
    privacy: {
      profile_visibility: 'public',
      show_email: false,
      show_phone: false,
      show_location: false
    },
    preferences: {
      theme: 'light',
      compact_mode: false,
      show_animations: true,
      auto_save: true
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [originalProfile, setOriginalProfile] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      const userProfile = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
        role: user.role || '',
        department: user.department || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        timezone: user.timezone || 'America/New_York',
        language: user.language || 'en',
        notifications: user.notifications || {
          email: true,
          push: true,
          sms: false,
          digest: 'daily'
        },
        privacy: user.privacy || {
          profile_visibility: 'public',
          show_email: false,
          show_phone: false,
          show_location: false
        },
        preferences: user.preferences || {
          theme: 'light',
          compact_mode: false,
          show_animations: true,
          auto_save: true
        }
      };
      setProfile(userProfile);
      setOriginalProfile(userProfile);
    }
  }, [user]);

  useEffect(() => {
    setHasChanges(JSON.stringify(profile) !== JSON.stringify(originalProfile));
  }, [profile, originalProfile]);

  const handleChange = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleNestedChange = (parent, key, value) => {
    setProfile(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value
      }
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    handleChange('avatar', '');
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      let updatedProfile = { ...profile };
      
      // If there's a new image file, upload it first
      if (imageFile) {
        const token = localStorage.getItem('accessToken');
        
        const formData = new FormData();
        formData.append('avatar', imageFile);
        
        const uploadResponse = await fetch('http://localhost:3000/api/auth/upload-avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Failed to upload image: ${errorText}`);
        }
        
        const uploadResult = await uploadResponse.json();
        if (uploadResult.success) {
          updatedProfile.avatar = uploadResult.data.avatarUrl;
        }
      }
      
      await updateProfile(updatedProfile);
      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      setHasChanges(false);
      setEditing(false);
      setImageFile(null);
      setImagePreview(null);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfile({ ...originalProfile });
    setHasChanges(false);
    setEditing(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  return {
    // State
    profile,
    passwordData,
    originalProfile,
    hasChanges,
    loading,
    saving,
    error,
    success,
    editing,
    imagePreview,
    imageFile,
    user,
    
    // Actions
    handleChange,
    handleNestedChange,
    handleImageUpload,
    handleRemoveImage,
    handleSave,
    handleCancel,
    handlePasswordChange,
    setEditing,
    setPasswordData,
    clearError,
    clearSuccess
  };
};
