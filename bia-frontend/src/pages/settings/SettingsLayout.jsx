import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  MdSettings,
  MdPerson,
  MdSecurity,
  MdNotifications,
  MdPalette,
  MdStorage,
  MdApi,
  MdIntegrationInstructions,
  MdAdminPanelSettings,
  MdArrowBack,
  MdSave,
  MdRefresh
} from 'react-icons/md';

const SettingsLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const settingsTabs = [
    {
      id: 'general',
      label: 'General',
      icon: MdSettings,
      path: '/settings',
      description: 'Project information and basic settings'
    },
    {
      id: 'users',
      label: 'Users',
      icon: MdPerson,
      path: '/settings/users',
      description: 'User management and permissions'
    },
    {
      id: 'security',
      label: 'Security',
      icon: MdSecurity,
      path: '/settings/security',
      description: 'Authentication and security policies'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: MdNotifications,
      path: '/settings/notifications',
      description: 'Email and push notification settings'
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: MdPalette,
      path: '/settings/appearance',
      description: 'Theme and UI customization'
    },
    {
      id: 'data',
      label: 'Data & Storage',
      icon: MdStorage,
      path: '/settings/data',
      description: 'Data retention and backup settings'
    },
    {
      id: 'api',
      label: 'API',
      icon: MdApi,
      path: '/settings/api',
      description: 'API configuration and rate limits'
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: MdIntegrationInstructions,
      path: '/settings/integrations',
      description: 'Third-party integrations and webhooks'
    },
    {
      id: 'system',
      label: 'System',
      icon: MdAdminPanelSettings,
      path: '/settings/system',
      description: 'System configuration and maintenance'
    }
  ];

  const getCurrentTab = () => {
    const currentPath = location.pathname;
    return settingsTabs.find(tab => tab.path === currentPath) || settingsTabs[0];
  };

  const currentTab = getCurrentTab();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Button
                onClick={() => navigate('/overview')}
                variant="outline"
                size="sm"
                icon={<MdArrowBack className="w-4 h-4" />}
              >
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              {hasUnsavedChanges && (
                <Badge variant="orange" icon={<MdSave className="w-3 h-3" />}>
                  Unsaved Changes
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mb-3">Manage your project configuration and preferences</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <currentTab.icon className="text-blue-500" />
                {currentTab.label}
              </span>
              <span className="text-gray-400">•</span>
              <span>{currentTab.description}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<MdRefresh className="w-4 h-4" />}
            >
              Refresh
            </Button>
            {hasUnsavedChanges && (
              <Button
                variant="primary"
                size="sm"
                icon={<MdSave className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings Categories</h3>
              <nav className="space-y-1">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => navigate(tab.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location.pathname === tab.path
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <div className="text-left">
                      <div>{tab.label}</div>
                      <div className="text-xs text-gray-500">{tab.description}</div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Outlet context={{ hasUnsavedChanges, setHasUnsavedChanges }} />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
