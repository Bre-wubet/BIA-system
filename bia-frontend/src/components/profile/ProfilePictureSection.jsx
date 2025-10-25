import React from 'react';
import Button from '../components/ui/Button';
import { MdAccountCircle, MdUpload, MdDelete } from 'react-icons/md';

const ProfilePictureSection = ({ 
  profile, 
  imagePreview, 
  editing, 
  onImageUpload, 
  onRemoveImage 
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
            {imagePreview || profile.avatar ? (
              <img 
                src={imagePreview || profile.avatar} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <MdAccountCircle className="w-12 h-12 text-gray-400" />
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
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <MdUpload className="w-4 h-4 text-white" />
                </div>
              </label>
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">
            Upload a profile picture to personalize your account
          </p>
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                className="hidden"
              />
              <Button variant="outline" size="sm" disabled={!editing}>
                <MdUpload className="w-4 h-4 mr-1" />
                Choose Image
              </Button>
            </label>
            {(imagePreview || profile.avatar) && editing && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRemoveImage}
              >
                <MdDelete className="w-4 h-4 mr-1" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG or GIF. Max size 5MB.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureSection;
