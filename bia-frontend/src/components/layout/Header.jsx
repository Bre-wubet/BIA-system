import React from 'react';
import UserMenu from './UserMenu';
import Notifications from './Notifications';
import { isActiveRoute } from '../../utils/layoutUtils';

const Header = ({ 
  userMenuOpen,
  notificationsOpen,
  userMenuRef,
  notificationsRef,
  handleUserMenuToggle,
  handleNotificationsToggle,
  handleProfile,
  handleSettings,
  handleLogout,
  openSidebar,
  location,
  filteredNavigationItems,
  user
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            onClick={openSidebar}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="ml-2 lg:ml-0 text-lg font-semibold text-gray-900">
            {filteredNavigationItems.find(item => isActiveRoute(item.path, location))?.title || 'Overview'}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Notifications
            notificationsOpen={notificationsOpen}
            notificationsRef={notificationsRef}
            handleNotificationsToggle={handleNotificationsToggle}
          />
          
          <UserMenu
            userMenuOpen={userMenuOpen}
            userMenuRef={userMenuRef}
            handleUserMenuToggle={handleUserMenuToggle}
            handleProfile={handleProfile}
            handleSettings={handleSettings}
            handleLogout={handleLogout}
            user={user}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
