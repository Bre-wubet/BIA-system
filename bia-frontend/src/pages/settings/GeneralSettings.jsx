import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  MdBusiness,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdWeb,
  MdLanguage,
  MdSchedule,
  MdSave,
  MdRefresh
} from 'react-icons/md';

const GeneralSettings = () => {
  const { setHasUnsavedChanges } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [settings, setSettings] = useState({
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
    dateFormat: 'MM/DD/YYYY'
  });

  const [originalSettings, setOriginalSettings] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasUnsavedChanges(hasChanges);
  }, [settings, originalSettings, setHasUnsavedChanges]);

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
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Loading settings..." />;
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <Alert variant="error" title="Error" message={error} />
      )}
      {success && (
        <Alert variant="success" title="Success" message={success} />
      )}

      {/* Project Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MdBusiness className="w-5 h-5" />
            Project Information
          </h3>
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
      </Card>

      {/* Contact Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MdEmail className="w-5 h-5" />
            Contact Information
          </h3>
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
      </Card>

      {/* Regional Settings */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MdLanguage className="w-5 h-5" />
            Regional Settings
          </h3>
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
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          onClick={fetchSettings}
          variant="outline"
          disabled={loading}
          icon={<MdRefresh className="w-4 h-4" />}
        >
          Reset
        </Button>
        <Button
          onClick={handleSave}
          variant="primary"
          disabled={saving}
          icon={saving ? <MdRefresh className="w-4 h-4 animate-spin" /> : <MdSave className="w-4 h-4" />}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default GeneralSettings;
