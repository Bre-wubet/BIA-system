import React, { useState } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import PersonalInfoTab from '../components/profile/PersonalInfoTab';
import SecurityTab from '../components/profile/SecurityTab';
import NotificationsTab from '../components/profile/NotificationsTab';
import PreferencesTab from '../components/profile/PreferencesTab';
import PrivacyTab from '../components/profile/PrivacyTab';
import { useProfile } from '../hooks/useProfile';
import { formatRole, getRoleBadgeColor } from '../utils/profileUtils';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('personal');
  
  const {
    // State
    profile,
    passwordData,
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
  } = useProfile();

  if (loading) {
    return <LoadingSpinner size="large" message="Loading profile..." />;
  }

  if (!user) {
    return <Alert variant="error" title="Error" message="User not found" />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalInfoTab
            profile={profile}
            editing={editing}
            imagePreview={imagePreview}
            onImageUpload={handleImageUpload}
            onRemoveImage={handleRemoveImage}
            onChange={handleChange}
          />
        );
      case 'security':
        return (
          <SecurityTab
            passwordData={passwordData}
            setPasswordData={setPasswordData}
            onPasswordChange={handlePasswordChange}
            saving={saving}
          />
        );
      case 'notifications':
        return (
          <NotificationsTab
            profile={profile}
            editing={editing}
            onChange={handleNestedChange}
          />
        );
      case 'preferences':
        return (
          <PreferencesTab
            profile={profile}
            editing={editing}
            onChange={handleNestedChange}
          />
        );
      case 'privacy':
        return (
          <PrivacyTab
            profile={profile}
            editing={editing}
            onChange={handleNestedChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <ProfileHeader
        profile={profile}
        user={user}
        editing={editing}
        saving={saving}
        imagePreview={imagePreview}
        onEdit={() => setEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        onImageUpload={handleImageUpload}
        formatRole={formatRole}
        getRoleBadgeColor={getRoleBadgeColor}
      />

      {/* Alerts */}
      {error && (
        <Alert variant="error" title="Error" message={error} />
      )}
      {success && (
        <Alert variant="success" title="Success" message={success} />
      )}

      {/* Profile Tabs */}
      <ProfileTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        {renderTabContent()}
      </ProfileTabs>
    </div>
  );
};

export default ProfilePage;