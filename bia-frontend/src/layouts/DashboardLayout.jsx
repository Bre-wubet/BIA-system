import React from 'react';
import { Outlet } from 'react-router-dom';
import { useDashboardLayout } from '../hooks/useDashboardLayout';
import { NAVIGATION_ITEMS } from '../constants/routes';
import { ROLE_PERMISSIONS } from '../constants/roles';
import Navbar from '../components/layout/Navbar';
import Header from '../components/layout/Header';

const DashboardLayout = () => {
  const {
    // State
    sidebarOpen,
    userMenuOpen,
    notificationsOpen,
    user,
    
    // Refs
    userMenuRef,
    notificationsRef,
    
    // Handlers
    handleUserMenuToggle,
    handleNotificationsToggle,
    handleLogout,
    handleSettings,
    handleProfile,
    closeSidebar,
    openSidebar,
    
    // Utils
    location
  } = useDashboardLayout();

  const userPermissions = ROLE_PERMISSIONS[user?.role] || {};
  const filteredNavigationItems = NAVIGATION_ITEMS.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar and Mobile Overlay */}
      <Navbar
        sidebarOpen={sidebarOpen}
        user={user}
        location={location}
        closeSidebar={closeSidebar}
        filteredNavigationItems={filteredNavigationItems}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Full-width Header */}
        <Header
          userMenuOpen={userMenuOpen}
          notificationsOpen={notificationsOpen}
          userMenuRef={userMenuRef}
          notificationsRef={notificationsRef}
          handleUserMenuToggle={handleUserMenuToggle}
          handleNotificationsToggle={handleNotificationsToggle}
          handleProfile={handleProfile}
          handleSettings={handleSettings}
          handleLogout={handleLogout}
          openSidebar={openSidebar}
          location={location}
          filteredNavigationItems={filteredNavigationItems}
          user={user}
        />

      {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
