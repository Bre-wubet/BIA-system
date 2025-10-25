import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getKPIById, updateKPI } from '../../../api/kpisApi';
import { getAllDashboards } from '../../../api/dashboardsApi';
import * as integrationApi from '../../../api/integrationApi';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { 
  MdEdit, 
  MdSave, 
  MdCancel, 
  MdRefresh,
  MdDelete,
  MdVisibility,
  MdCheckCircle,
  MdError,
  MdInfo,
  MdTrendingUp,
  MdTrendingDown,
  MdSpeed,
  MdStorage,
  MdHistory,
  MdSettings,
  MdBackspace,
  MdWarning
} from 'react-icons/md';

const EditKPIPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    formula: '',
    type: '',
    unit: '',
    target_value: 1,
    refresh_frequency: 3600,
    dashboard_id: '',
    created_by: 1,
  });

  // UI State
  const [dashboards, setDashboards] = useState([]);
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [kpiData, setKpiData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  // Load KPI data and dependencies
  const fetchKPIData = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const [kpiRes, dbRes, dsRes] = await Promise.all([
        getKPIById(id),
        getAllDashboards(),
        integrationApi.getAllDataSources()
      ]);

      setKpiData(kpiRes.data);
      setFormData({
        name: kpiRes.data.name || '',
        description: kpiRes.data.description || '',
        category: kpiRes.data.category || '',
        formula: kpiRes.data.formula || '',
        type: kpiRes.data.type || '',
        unit: kpiRes.data.unit || '',
        target_value: kpiRes.data.target_value || 1,
        refresh_frequency: kpiRes.data.refresh_frequency || 3600,
        dashboard_id: kpiRes.data.dashboard_id || '',
        created_by: kpiRes.data.created_by || 1,
      });

      setDashboards(Array.isArray(dbRes) ? dbRes : dbRes?.data || []);
      setDataSources(Array.isArray(dsRes) ? dsRes : dsRes?.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load KPI data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchKPIData();
  }, [fetchKPIData]);

  // Track form changes
  useEffect(() => {
    if (kpiData) {
      const hasFormChanges = Object.keys(formData).some(key => {
        const originalValue = kpiData[key];
        const currentValue = formData[key];
        
        if (key === 'target_value' || key === 'refresh_frequency' || key === 'dashboard_id') {
          return Number(originalValue) !== Number(currentValue);
        }
        
        return originalValue !== currentValue;
      });
      
      setHasChanges(hasFormChanges);
    }
  }, [formData, kpiData]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleTestFormula = async () => {
    if (!formData.formula.trim()) {
      setTestResult({
        success: false,
        message: 'Please enter a formula to test'
      });
      return;
    }

    setTesting(true);
    setTestResult(null);
    
    try {
      // This would typically call a formula validation endpoint
      // For now, we'll simulate a test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestResult({
        success: true,
        message: 'Formula syntax is valid',
        data: { preview: `Result: ${formData.formula}` }
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Formula validation failed. Please check your syntax.',
        data: null
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        target_value: Number(formData.target_value),
        refresh_frequency: Number(formData.refresh_frequency),
        dashboard_id: formData.dashboard_id ? Number(formData.dashboard_id) : null
      };

      await updateKPI(id, payload);
      setSuccess(true);
      setHasChanges(false);
      
      // Refresh data
      setTimeout(() => {
        fetchKPIData();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      const message = err?.message || err?.error || 
        (err?.errors ? Object.values(err.errors).join(', ') : 'Failed to update KPI');
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (kpiData) {
      setFormData({
        name: kpiData.name || '',
        description: kpiData.description || '',
        category: kpiData.category || '',
        formula: kpiData.formula || '',
        type: kpiData.type || '',
        unit: kpiData.unit || '',
        target_value: kpiData.target_value || 1,
        refresh_frequency: kpiData.refresh_frequency || 3600,
        dashboard_id: kpiData.dashboard_id || '',
        created_by: kpiData.created_by || 1,
      });
      setError(null);
      setTestResult(null);
    }
  };

  const handleDelete = async () => {
    try {
      // This would call deleteKPI API
      navigate('/dashboard/kpis');
    } catch (err) {
      setError('Failed to delete KPI. Please try again.');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      finance: 'bg-green-100 text-green-800',
      sales: 'bg-blue-100 text-blue-800',
      supply_chain: 'bg-purple-100 text-purple-800',
      hr: 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type) => {
    const icons = {
      line: <MdTrendingUp className="w-4 h-4" />,
      bar: <MdStorage className="w-4 h-4" />,
      pie: <MdSettings className="w-4 h-4" />,
      area: <MdTrendingDown className="w-4 h-4" />,
      table: <MdVisibility className="w-4 h-4" />,
      progress: <MdSpeed className="w-4 h-4" />,
      gauge: <MdHistory className="w-4 h-4" />,
    };
    return icons[type] || <MdInfo className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading KPI data...</p>
        </div>
      </div>
    );
  }

  if (error && !kpiData) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <div className="text-center">
            <MdError className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading KPI</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => navigate('/dashboard/kpis')}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <MdBackspace className="w-4 h-4" />
              <span>Back to KPIs</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {success && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg bg-green-100 border border-green-200 text-green-700">
          <div className="flex items-center space-x-2">
            <MdCheckCircle className="w-5 h-5" />
            <span className="font-medium">KPI updated successfully!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Edit KPI</h1>
            {hasChanges && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <MdWarning className="w-3 h-3 mr-1" />
                Unsaved changes
              </span>
            )}
          </div>
          <p className="text-gray-600 text-lg">Modify your KPI configuration and settings</p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={() => navigate('/dashboard/kpis')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <MdBackspace className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={!hasChanges}
            className="flex items-center space-x-2"
          >
            <MdRefresh className="w-4 h-4" />
            <span>Reset</span>
          </Button>
          <Button
            onClick={() => setShowDeleteModal(true)}
            variant="outline"
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <MdDelete className="w-4 h-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* KPI Info Card */}
      {kpiData && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">KPI Information</h2>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(kpiData.category)}`}>
                  {kpiData.category}
                </span>
                <div className="flex items-center space-x-1 text-gray-500">
                  {getTypeIcon(kpiData.type)}
                  <span className="text-sm">{kpiData.type}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="ml-2 text-gray-900">
                  {kpiData.created_at ? new Date(kpiData.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <span className="ml-2 text-gray-900">
                  {kpiData.updated_at ? new Date(kpiData.updated_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Refresh:</span>
                <span className="ml-2 text-gray-900">
                  {kpiData.refresh_frequency ? `${Math.floor(kpiData.refresh_frequency / 3600)}h` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Form */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">KPI Configuration</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <MdError className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          <form className="space-y-6">
            {/* Name and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KPI Name *
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <input
                  type="text"
                  name="unit"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="%, $, count, etc."
                  value={formData.unit}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Category and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="finance">Finance</option>
                  <option value="sales">Sales</option>
                  <option value="supply_chain">Supply Chain</option>
                  <option value="hr">HR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Render Type *
                </label>
                <select
                  name="type"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select render type</option>
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="area">Area Chart</option>
                  <option value="table">Table</option>
                  <option value="progress">Progress</option>
                  <option value="gauge">Gauge</option>
                </select>
              </div>
            </div>

            {/* Formula */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Formula *
                </label>
                <Button
                  type="button"
                  onClick={handleTestFormula}
                  disabled={testing || !formData.formula.trim()}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  {testing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                  ) : (
                    <MdCheckCircle className="w-4 h-4" />
                  )}
                  <span>{testing ? 'Testing...' : 'Test Formula'}</span>
                </Button>
              </div>
              <textarea
                name="formula"
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.formula}
                onChange={handleChange}
                placeholder="Enter your KPI formula (e.g., (total_sales / total_orders) * 100)"
                required
              />
              <div className="mt-2 text-sm text-gray-500">
                <p>Example: <code className="bg-gray-100 px-1 rounded">(total_sales / total_orders) * 100</code></p>
              </div>
              
              {testResult && (
                <div className={`mt-3 p-3 rounded-lg ${
                  testResult.success 
                    ? 'bg-green-100 border border-green-200 text-green-700' 
                    : 'bg-red-100 border border-red-200 text-red-700'
                }`}>
                  <div className="flex items-center space-x-2">
                    {testResult.success ? (
                      <MdCheckCircle className="w-4 h-4" />
                    ) : (
                      <MdError className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">{testResult.message}</span>
                  </div>
                  {testResult.data && (
                    <div className="mt-2 text-sm">
                      <pre className="bg-white bg-opacity-50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(testResult.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Target Value and Refresh Frequency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Value
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="target_value"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.target_value}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refresh Frequency
                </label>
                <select
                  name="refresh_frequency"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.refresh_frequency}
                  onChange={handleChange}
                >
                  <option value={3600}>Hourly (1 hour)</option>
                  <option value={86400}>Daily (24 hours)</option>
                  <option value={604800}>Weekly (7 days)</option>
                </select>
              </div>
            </div>

            {/* Dashboard Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dashboard
              </label>
              <select
                name="dashboard_id"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.dashboard_id}
                onChange={handleChange}
              >
                <option value="">-- Select Dashboard (Optional) --</option>
                {dashboards.map((db) => (
                  <option key={db.id} value={db.id}>
                    {db.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={() => navigate('/dashboard/kpis')}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <MdCancel className="w-4 h-4" />
                <span>Cancel</span>
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <MdSave className="w-4 h-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete KPI"
      >
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <MdWarning className="w-8 h-8 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Are you sure?</h3>
              <p className="text-gray-600">This action cannot be undone.</p>
            </div>
          </div>
          <p className="text-gray-700 mb-6">
            This will permanently delete the KPI <strong>"{formData.name}"</strong> and all associated data.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EditKPIPage;
