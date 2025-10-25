import React from 'react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Tooltip from '../components/ui/Tooltip';
import { 
  MdAccountCircle, 
  MdEdit, 
  MdSave, 
  MdCancel, 
  MdRefresh, 
  MdUpload,
  MdVerifiedUser,
  MdEmail,
  MdBusiness,
  MdSchedule
} from 'react-icons/md';

const ProfileHeader = ({ 
  profile, 
  user, 
  editing, 
  saving, 
  hasChanges, 
  imagePreview, 
  imageFile,
  onEdit, 
  onSave, 
  onCancel, 
  onImageUpload,
  formatRole,
  getRoleBadgeColor 
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
              {imagePreview || profile.avatar ? (
                <img 
                  src={imagePreview || profile.avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <MdAccountCircle className="w-10 h-10 text-blue-600" />
              )}
            </div>
            {editing && (
              <div className="absolute -bottom-1 -right-1">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageUpload}
                    className="hidden"
                  />
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <MdUpload className="w-3 h-3 text-white" />
                  </div>
                </label>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.first_name} {profile.last_name}
              </h1>
              <Badge variant="blue" className={getRoleBadgeColor(profile.role)}>
                {formatRole(profile.role)}
              </Badge>
              {user.email_verified && (
                <Tooltip content="Email verified">
                  <MdVerifiedUser className="w-5 h-5 text-green-500" />
                </Tooltip>
              )}
            </div>
            <p className="text-gray-600 mb-2">@{profile.username}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MdEmail className="text-blue-500" />
                {profile.email}
              </span>
              <span className="flex items-center gap-1">
                <MdBusiness className="text-green-500" />
                {profile.department || 'No department'}
              </span>
              <span className="flex items-center gap-1">
                <MdSchedule className="text-purple-500" />
                {profile.timezone}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content="Refresh profile">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              <MdRefresh className="w-4 h-4" />
            </Button>
          </Tooltip>
          {editing ? (
            <>
              <Button
                onClick={onCancel}
                variant="outline"
                size="sm"
                disabled={saving}
              >
                <MdCancel className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                onClick={onSave}
                variant="primary"
                size="sm"
                disabled={!hasChanges || saving}
                icon={saving ? <MdRefresh className="w-4 h-4 animate-spin" /> : <MdSave className="w-4 h-4" />}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button
              onClick={onEdit}
              variant="primary"
              size="sm"
              icon={<MdEdit className="w-4 h-4" />}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
