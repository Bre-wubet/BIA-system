import React from 'react';
import { Link } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import { 
  MdDashboard as MdDashboardIcon,
  MdTrendingUp as MdTrendingUpIcon,
  MdWidgets as MdWidgetsIcon,
  MdAnalytics as MdAnalyticsIcon,
  MdAssessment as MdAssessmentIcon,
  MdIntegrationInstructions as MdIntegrationInstructionsIcon
} from 'react-icons/md';
import { formatRole, getProfileImageUrl, handleImageError, isActiveRoute, getRoleBadgeColors } from '../../utils/layoutUtils';

const Sidebar = ({ 
  sidebarOpen, 
  user, 
  location, 
  closeSidebar,
  filteredNavigationItems 
}) => {
  const roleBadgeColors = getRoleBadgeColors();

  return (
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
            onClick={closeSidebar}
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
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <>
                  <img 
                    src={getProfileImageUrl(user.avatar)} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                  <svg className="w-6 h-6 text-gray-600 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </>
              ) : (
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
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
            {/* Dashboards Section */}
            <NavigationSection
              title="Dashboards"
              items={filteredNavigationItems.filter(item => item.section === "dashboard")}
              location={location}
              closeSidebar={closeSidebar}
              getIcon={(icon) => {
                if (icon === "dashboard") return <MdDashboardIcon className="w-5 h-5" />;
                return null;
              }}
            />

            {/* KPI & Widgets Section */}
            <NavigationSection
              title="KPI & Widgets"
              items={filteredNavigationItems.filter(item => item.section === "analytics")}
              location={location}
              closeSidebar={closeSidebar}
              getIcon={(icon) => {
                if (icon === "trending_up") return <MdTrendingUpIcon className="w-5 h-5" />;
                if (icon === "widgets") return <MdWidgetsIcon className="w-5 h-5" />;
                if (icon === "analytics") return <MdAnalyticsIcon className="w-5 h-5" />;
                return null;
              }}
            />

            {/* Reports Section */}
            <NavigationSection
              title="Reports & Analytics"
              items={filteredNavigationItems.filter(item => item.section === "reports")}
              location={location}
              closeSidebar={closeSidebar}
              getIcon={() => <MdAssessmentIcon className="w-5 h-5" />}
            />

            {/* Integration Section */}
            <NavigationSection
              title="Integration"
              items={filteredNavigationItems.filter(item => item.section === "integration")}
              location={location}
              closeSidebar={closeSidebar}
              getIcon={(icon) => {
                if (icon === "integration_instructions") return <MdIntegrationInstructionsIcon className="w-5 h-5" />;
                return null;
              }}
            />
          </div>
        </nav>
      </div>
    </aside>
  );
};

const NavigationSection = ({ title, items, location, closeSidebar, getIcon }) => (
  <div>
    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
      {title}
    </p>
    {items.map((item) => (
      <Link
        key={item.path}
        to={item.path}
        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          isActiveRoute(item.path, location)
            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
        onClick={closeSidebar}
      >
        <span className="mr-3">
          {getIcon(item.icon)}
        </span>
        {item.title}
      </Link>
    ))}
  </div>
);

export default Sidebar;
