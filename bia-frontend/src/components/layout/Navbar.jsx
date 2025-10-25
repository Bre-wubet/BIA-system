import React from 'react';
import Sidebar from './Sidebar';

const Navbar = ({ 
  sidebarOpen,
  user,
  location,
  closeSidebar,
  filteredNavigationItems
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        user={user}
        location={location}
        closeSidebar={closeSidebar}
        filteredNavigationItems={filteredNavigationItems}
      />
    </>
  );
};

export default Navbar;
