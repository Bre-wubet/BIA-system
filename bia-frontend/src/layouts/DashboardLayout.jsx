import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { NAVIGATION_ITEMS, ROUTES } from '../constants/routes';
import { ROLES, ROLE_PERMISSIONS } from '../constants/roles';
import Button from '../components/ui/Button';
import { 
  MdDashboard, MdTrendingUp, MdWidgets, MdAnalytics, 
  MdIntegrationInstructions, MdAssessment, MdSettings 
} from "react-icons/md";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole] = useState(ROLES.ADMIN); // Mock user role
  const location = useLocation();

  const userPermissions = ROLE_PERMISSIONS[userRole] || {};
  const filteredNavigationItems = NAVIGATION_ITEMS.filter(item => 
    item.roles.includes(userRole)
  );

  // set isActiveRoute based on the roles overview
  const isActiveRoute = (path) => {
    if (path === ROUTES.OVERVIEW) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Role-based badge colors
  const roleBadgeColors = {
    [ROLES.ADMIN]: "bg-blue-100 text-blue-700",
    [ROLES.MANAGER]: "bg-indigo-100 text-indigo-700",
    [ROLES.FINANCE]: "bg-green-100 text-green-700",
    [ROLES.SALES]: "bg-yellow-100 text-yellow-700",
    [ROLES.HR]: "bg-purple-100 text-purple-700",
    [ROLES.OPERATIONS]: "bg-red-100 text-red-700",
  };

  // Quick Actions based on role
  const getQuickActions = () => {
    switch (userRole) {
      case ROLES.FINANCE:
        return ["New Budget Report", "Export Ledger"];
      case ROLES.SALES:
        return ["New Campaign Report", "Export Leads"];
      case ROLES.HR:
        return ["New Employee Report", "Export HR Data"];
      case ROLES.OPERATIONS:
        return ["New Operations Report", "Export Supply Chain Data"];
      case ROLES.MANAGER:
        return ["New Performance Report", "Export Team Data"];
      case ROLES.ADMIN:
        return ["User Management", "System Settings"];
      default:
        return ["New Report", "Export Data"];
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">BIA</span>
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900">
                Analytics
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Brie</p>
                <p className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${roleBadgeColors[userRole]}`}>
                  {userRole.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-3 flex-1 overflow-y-auto">
            <div className="space-y-4">
              {/* Grouped sections */}
              <div>
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Dashboards
                </p>
                {filteredNavigationItems
                  .filter(item => item.section === "dashboard")
                  .map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActiveRoute(item.path)
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="mr-3">
                      {item.icon === "dashboard" && <MdDashboard className="w-5 h-5" />}
                    </span>
                    {item.title}
                  </Link>
                ))}
              </div>

              {/* widgets section */}
              <div>
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                 KPI & Widgets
                </p>
                {filteredNavigationItems
                  .filter(item => item.section === "analytics")
                  .map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActiveRoute(item.path)
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-3">
                        {item.icon === "trending_up" && <MdTrendingUp className="w-5 h-5" />}
                        {item.icon === "widgets" && <MdWidgets className="w-5 h-5" />}
                        {item.icon === "analytics" && <MdAnalytics className="w-5 h-5" />}
                      </span>
                      {item.title}
                    </Link>
                  ))}
              </div>
              {/* Reports Section */}
              <div>
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Reports & Analytics
                </p>
                {filteredNavigationItems
                  .filter(item => item.section === "reports")
                  .map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActiveRoute(item.path)
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-3">
                        <MdAssessment className="w-5 h-5" />
                      </span>
                      {item.title}
                    </Link>
                ))}
              </div>
              {/* integration section */}
              <div>
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Integration
                </p>
                {filteredNavigationItems
                  .filter(item => item.section === "integration")
                  .map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActiveRoute(item.path)
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-3">
                        {item.icon === "integration_instructions" && <MdIntegrationInstructions className="w-5 h-5" />}
                      </span>
                      {item.title}
                    </Link>
                  ))}
              </div>
              {/* Settings Section */}
              <div>
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Settings
                </p>
                {filteredNavigationItems
                  .filter(item => item.section === "settings")
                  .map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActiveRoute(item.path)
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-3">
                        {item.icon === "settings" && <MdSettings className="w-5 h-5" />}
                      </span>
                      {item.title}
                    </Link>
                  ))}
              </div>
            </div>
          </nav>

          {/* Quick Actions */}
          <div className="mt-6 px-3 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {getQuickActions().map((action, idx) => (
                  <Button key={idx} variant="outline" size="sm" fullWidth>
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-2 lg:ml-0 text-lg font-semibold text-gray-900">
                {filteredNavigationItems.find(item => isActiveRoute(item.path))?.title || 'Overview'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-600 rounded-full ring-2 ring-white" />
              </button>
              
              {/* User Menu */}
              <div className="relative">
                <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span className="sr-only">Open user menu</span>
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </button>
                {/* Dropdown menu can be implemented here */}
              </div>            
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
