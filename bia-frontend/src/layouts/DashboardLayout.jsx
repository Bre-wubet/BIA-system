import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { NAVIGATION_ITEMS, ROUTES } from '../constants/routes';
import { ROLES, ROLE_PERMISSIONS } from '../constants/roles';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Tooltip from '../components/ui/Tooltip';
import { 
  MdDashboard, MdTrendingUp, MdWidgets, MdAnalytics, 
  MdIntegrationInstructions, MdAssessment, MdSettings,
  MdPerson, MdNotifications, MdHelp, MdLogout, MdMenu,
  MdClose, MdKeyboardArrowDown, MdAccountCircle, MdSecurity,
  MdPalette, MdLanguage, MdStorage, MdApi, MdAdminPanelSettings,
  MdBusiness, MdEmail, MdPhone, MdLocationOn, MdWeb,
  MdRefresh, MdSave, MdEdit, MdDelete, MdAdd, MdCheck,
  MdWarning, MdError, MdInfo, MdVisibility, MdVisibilityOff,
  MdDownload, MdUpload, MdSync, MdCode, MdDataUsage,
  MdSchedule, MdLock, MdPublic, MdTrendingUp as MdTrendingUpIcon,
  MdAnalytics as MdAnalyticsIcon, MdDashboard as MdDashboardIcon,
  MdWidgets as MdWidgetsIcon, MdAssessment as MdAssessmentIcon,
  MdIntegrationInstructions as MdIntegrationInstructionsIcon
} from "react-icons/md";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const [notifications] = useState([
    { id: 1, title: 'New KPI Alert', message: 'Revenue target exceeded by 15%', time: '2 min ago', type: 'success' },
    { id: 2, title: 'System Update', message: 'Scheduled maintenance tonight at 2 AM', time: '1 hour ago', type: 'info' },
    { id: 3, title: 'Data Sync Failed', message: 'Integration with CRM failed', time: '3 hours ago', type: 'error' }
  ]);
  const [unreadNotifications] = useState(2);
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Utility function to format role for display
  const formatRole = (role) => {
    if (typeof role === 'string') {
      return role.replace('_', ' ');
    }
    return 'User';
  };

  const userPermissions = ROLE_PERMISSIONS[user?.role] || {};
  const filteredNavigationItems = NAVIGATION_ITEMS.filter(item => 
    item.roles.includes(user?.role)
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handler functions
  const handleUserMenuToggle = () => {
    setUserMenuOpen(!userMenuOpen);
    setNotificationsOpen(false);
  };

  const handleNotificationsToggle = () => {
    setNotificationsOpen(!notificationsOpen);
    setUserMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if logout fails
      navigate(ROUTES.LOGIN);
    }
  };

  const handleSettings = () => {
    navigate('/settings');
    setUserMenuOpen(false);
  };

  const handleProfile = () => {
    navigate('/profile');
    setUserMenuOpen(false);
  };

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
    switch (user?.role) {
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
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user?.username || 'User'
                  }
                </p>
                <p className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${roleBadgeColors[user?.role] || 'bg-gray-100 text-gray-700'}`}>
                  {formatRole(user?.role)}
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
                      {item.icon === "dashboard" && <MdDashboardIcon className="w-5 h-5" />}
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
                        {item.icon === "trending_up" && <MdTrendingUpIcon className="w-5 h-5" />}
                        {item.icon === "widgets" && <MdWidgetsIcon className="w-5 h-5" />}
                        {item.icon === "analytics" && <MdAnalyticsIcon className="w-5 h-5" />}
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
                        <MdAssessmentIcon className="w-5 h-5" />
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
                        {item.icon === "integration_instructions" && <MdIntegrationInstructionsIcon className="w-5 h-5" />}
                      </span>
                      {item.title}
                    </Link>
                  ))}
              </div>
              {/* Settings Section
              <div>
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Settings & Configuration
                </p>
                <div className="space-y-1">
                  <Link
                    to="/settings"
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActiveRoute('/settings')
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="mr-3">
                      <MdSettings className="w-5 h-5" />
                    </span>
                    Project Settings
                  </Link>
                  <Link
                    to="/settings/users"
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActiveRoute('/settings/users')
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="mr-3">
                      <MdPerson className="w-5 h-5" />
                    </span>
                    User Management
                  </Link>
                  <Link
                    to="/settings/security"
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActiveRoute('/settings/security')
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="mr-3">
                      <MdSecurity className="w-5 h-5" />
                    </span>
                    Security
                  </Link>
                  <Link
                    to="/settings/integrations"
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActiveRoute('/settings/integrations')
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="mr-3">
                      <MdApi className="w-5 h-5" />
                    </span>
                    Integrations
                  </Link>
                  <Link
                    to="/settings/system"
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActiveRoute('/settings/system')
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="mr-3">
                      <MdAdminPanelSettings className="w-5 h-5" />
                    </span>
                    System
                  </Link>
                </div>
              </div> */}
            </div>
          </nav>

          {/* Quick Actions */}
          {/* <div className="mt-6 px-3 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <h3 className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MdTrendingUp className="w-4 h-4" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                {getQuickActions().map((action, idx) => (
                  <Button 
                    key={idx} 
                    variant="outline" 
                    size="sm" 
                    fullWidth
                    className="text-xs hover:bg-blue-100 hover:border-blue-300"
                  >
                    {action}
                  </Button>
                ))}
                <div className="pt-2 border-t border-blue-200">
                  <Button 
                    onClick={() => navigate('/settings')}
                    variant="primary" 
                    size="sm" 
                    fullWidth
                    className="text-xs"
                    icon={<MdSettings className="w-3 h-3" />}
                  >
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          </div> */}
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
              <div className="relative" ref={notificationsRef}>
                <Tooltip content="Notifications">
                  <button 
                    onClick={handleNotificationsToggle}
                    className="p-2 rounded-full text-gray-400 hover:text-gray-600 relative transition-colors"
                  >
                    <MdNotifications className="w-6 h-6" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadNotifications}
                      </span>
                    )}
                  </button>
                </Tooltip>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        <Badge variant="blue" size="sm">{unreadNotifications} unread</Badge>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.type === 'success' ? 'bg-green-500' :
                              notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                            }`} />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <Button variant="outline" size="sm" fullWidth>
                        View All Notifications
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <Tooltip content="User menu">
                  <button 
                    onClick={handleUserMenuToggle}
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <MdPerson className="w-5 h-5 text-white" />
                    </div>
                    <MdKeyboardArrowDown className={`w-4 h-4 ml-1 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                </Tooltip>

                {/* User Menu Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <MdPerson className="w-6 h-6 text-white" />
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
