import React from 'react';
import Tooltip from '../ui/Tooltip';
import { 
  MdPerson, 
  MdKeyboardArrowDown, 
  MdAccountCircle, 
  MdSettings, 
  MdSecurity, 
  MdHelp, 
  MdLogout 
} from 'react-icons/md';
import { formatRole, getProfileImageUrl, handleImageError } from '../../utils/layoutUtils';

const UserMenu = ({ 
  userMenuOpen, 
  userMenuRef, 
  handleUserMenuToggle, 
  handleProfile, 
  handleSettings, 
  handleLogout,
  user 
}) => {
  return (
    <div className="relative" ref={userMenuRef}>
      <Tooltip content="User menu">
        <button 
          onClick={handleUserMenuToggle}
          className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <span className="sr-only">Open user menu</span>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <>
                <img 
                  src={getProfileImageUrl(user.avatar)} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
                <MdPerson className="w-5 h-5 text-white hidden" />
              </>
            ) : (
              <MdPerson className="w-5 h-5 text-white" />
            )}
          </div>
          <MdKeyboardArrowDown className={`w-4 h-4 ml-1 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
        </button>
      </Tooltip>

      {/* User Menu Dropdown */}
      {userMenuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <>
                    <img 
                      src={getProfileImageUrl(user.avatar)} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                    <MdPerson className="w-6 h-6 text-white hidden" />
                  </>
                ) : (
                  <MdPerson className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user?.username || 'User'
                  }
                </p>
                <p className="text-xs text-gray-500">{formatRole(user?.role)}</p>
              </div>
            </div>
          </div>
          <div className="py-2">
            <button
              onClick={handleProfile}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <MdAccountCircle className="w-5 h-5" />
              Profile
            </button>
            <button
              onClick={handleSettings}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <MdSettings className="w-5 h-5" />
              Settings
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <MdSecurity className="w-5 h-5" />
              Security
            </button>
            <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <MdHelp className="w-5 h-5" />
              Help & Support
            </button>
            <div className="border-t border-gray-200 my-2" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <MdLogout className="w-5 h-5" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
