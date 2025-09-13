import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Tooltip from '../components/ui/Tooltip';
import {
  MdSettings,
  MdPerson,
  MdSecurity,
  MdNotifications,
  MdPalette,
  MdLanguage,
  MdStorage,
  MdApi,
  MdCloudSync,
  MdBackup,
  MdRestore,
  MdSave,
  MdRefresh,
  MdEdit,
  MdDelete,
  MdAdd,
  MdCheck,
  MdWarning,
  MdError,
  MdInfo,
  MdVisibility,
  MdVisibilityOff,
  MdDownload,
  MdUpload,
  MdSync,
  MdHelp,
  MdCode,
  MdDataUsage,
  MdSchedule,
  MdLock,
  MdPublic,
  MdAdminPanelSettings,
  MdBusiness,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdWeb,
  MdDescription,
  MdCategory,
  MdTrendingUp,
  MdAnalytics,
  MdDashboard,
  MdWidgets,
  MdAssessment,
  MdIntegrationInstructions
} from 'react-icons/md';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    projectName: 'Business Intelligence Analytics',
    projectDescription: 'Comprehensive BI and analytics platform for business insights',
    companyName: 'Your Company Inc.',
    companyEmail: 'admin@company.com',
    companyPhone: '+1 (555) 123-4567',
    companyAddress: '123 Business St, City, State 12345',
    companyWebsite: 'https://company.com',
    timezone: 'America/New_York',
    language: 'en',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    
    // User Management
    allowRegistration: true,
    requireEmailVerification: true,
    defaultUserRole: 'user',
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    
    // Security Settings
    enableTwoFactor: false,
    passwordMinLength: 8,
    requireSpecialChars: true,
    passwordExpiry: 90,
    enableAuditLog: true,
    ipWhitelist: [],
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    notificationFrequency: 'immediate',
    digestSchedule: 'daily',
    
    // Appearance Settings
    theme: 'light',
    primaryColor: '#3B82F6',
    sidebarCollapsed: false,
    compactMode: false,
    showAnimations: true,
    
    // Data & Storage
    dataRetentionDays: 365,
    autoBackup: true,
    backupFrequency: 'daily',
    maxFileSize: 100,
    allowedFileTypes: ['csv', 'xlsx', 'json', 'xml'],
    
    // API Settings
    apiRateLimit: 1000,
    apiTimeout: 30,
    enableCORS: true,
    apiVersion: 'v1',
    
    // Integration Settings
    enableWebhooks: true,
    webhookSecret: '',
    enableSSO: false,
    ssoProvider: 'none',
    
    // System Settings
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info',
    maxConcurrentUsers: 100,
    enableAnalytics: true,
    enableErrorReporting: true
  });

  const [originalSettings, setOriginalSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(originalSettings));
  }, [settings, originalSettings]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOriginalSettings({ ...settings });
      setError(null);
    } catch (err) {
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOriginalSettings({ ...settings });
      setHasChanges(false);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({ ...originalSettings });
    setHasChanges(false);
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayChange = (key, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    handleChange(key, array);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: MdSettings },
    { id: 'users', label: 'Users', icon: MdPerson },
    { id: 'security', label: 'Security', icon: MdSecurity },
    { id: 'notifications', label: 'Notifications', icon: MdNotifications },
    { id: 'appearance', label: 'Appearance', icon: MdPalette },
    { id: 'data', label: 'Data & Storage', icon: MdStorage },
    { id: 'api', label: 'API', icon: MdApi },
    { id: 'integrations', label: 'Integrations', icon: MdIntegrationInstructions },
    { id: 'system', label: 'System', icon: MdAdminPanelSettings }
  ];

  if (loading) {
    return <LoadingSpinner size="large" message="Loading settings..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Project Settings</h1>
              <Badge variant="blue" icon={<MdSettings className="w-3 h-3" />}>
                Configuration
              </Badge>
            </div>
            <p className="text-gray-600 mb-3">Manage your project configuration and preferences</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MdBusiness className="text-blue-500" />
                {settings.projectName}
              </span>
              <span className="flex items-center gap-1">
                <MdLanguage className="text-green-500" />
                {settings.language.toUpperCase()}
              </span>
              <span className="flex items-center gap-1">
                <MdSchedule className="text-purple-500" />
                {settings.timezone}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip content="Refresh settings">
              <Button
                onClick={fetchSettings}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <MdRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </Tooltip>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              disabled={!hasChanges}
            >
              Reset
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              size="sm"
              disabled={!hasChanges || saving}
              icon={saving ? <MdRefresh className="w-4 h-4 animate-spin" /> : <MdSave className="w-4 h-4" />}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="error" title="Error" message={error} />
      )}
      {success && (
        <Alert variant="success" title="Success" message={success} />
      )}

      {/* Settings Tabs */}
      <Card>
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant={activeTab === tab.id ? 'primary' : 'outline'}
                size="sm"
                icon={<tab.icon className="w-4 h-4" />}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={settings.projectName}
                      onChange={(e) => handleChange('projectName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Description
                    </label>
                    <textarea
                      value={settings.projectDescription}
                      onChange={(e) => handleChange('projectDescription', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.companyEmail}
                      onChange={(e) => handleChange('companyEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={settings.companyPhone}
                      onChange={(e) => handleChange('companyPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={settings.companyWebsite}
                      onChange={(e) => handleChange('companyWebsite', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={settings.companyAddress}
                      onChange={(e) => handleChange('companyAddress', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => handleChange('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleChange('language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => handleChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="CAD">CAD (C$)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Add an extra layer of security to user accounts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableTwoFactor}
                        onChange={(e) => handleChange('enableTwoFactor', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Password Length
                      </label>
                      <input
                        type="number"
                        min="6"
                        max="32"
                        value={settings.passwordMinLength}
                        onChange={(e) => handleChange('passwordMinLength', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password Expiry (days)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="365"
                        value={settings.passwordExpiry}
                        onChange={(e) => handleChange('passwordExpiry', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Require Special Characters</h4>
                      <p className="text-sm text-gray-600">Passwords must contain special characters</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.requireSpecialChars}
                        onChange={(e) => handleChange('requireSpecialChars', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="480"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="10"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <select
                      value={settings.theme}
                      onChange={(e) => handleChange('theme', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => handleChange('primaryColor', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => handleChange('primaryColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interface Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Compact Mode</h4>
                      <p className="text-sm text-gray-600">Use smaller spacing and components</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.compactMode}
                        onChange={(e) => handleChange('compactMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Show Animations</h4>
                      <p className="text-sm text-gray-600">Enable smooth transitions and animations</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showAnimations}
                        onChange={(e) => handleChange('showAnimations', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
                      <p className="text-sm text-gray-600">Temporarily disable access for maintenance</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Debug Mode</h4>
                      <p className="text-sm text-gray-600">Enable detailed error logging</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.debugMode}
                        onChange={(e) => handleChange('debugMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Concurrent Users
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      value={settings.maxConcurrentUsers}
                      onChange={(e) => handleChange('maxConcurrentUsers', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Log Level
                    </label>
                    <select
                      value={settings.logLevel}
                      onChange={(e) => handleChange('logLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="error">Error</option>
                      <option value="warn">Warning</option>
                      <option value="info">Info</option>
                      <option value="debug">Debug</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
