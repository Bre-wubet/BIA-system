import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as integrationApi from '../../../api/integrationApi';
import MappingRuleList from '../components/MappingRuleList';
import DataSourceSyncHistory from '../components/DataSyncLogByDatasourceId';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Modal from '../../../components/ui/Modal';
import { 
  MdDelete, 
  MdEdit, 
  MdSync, 
  MdBackspace, 
  MdCastConnected,
  MdRefresh,
  MdVisibility,
  MdCheckCircle,
  MdError,
  MdSchedule,
  MdInfo,
  MdTrendingUp,
  MdTrendingDown,
  MdSpeed,
  MdStorage,
  MdHistory,
  MdSettings,
  MdPlayArrow,
  MdPause,
  MdStop
} from 'react-icons/md';

const DataSourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [syncHistory, setSyncHistory] = useState([]);
  const [syncStats, setSyncStats] = useState({});
  const [realTimeStatus, setRealTimeStatus] = useState(null);

  // Memoized statistics
  const statistics = useMemo(() => {
    if (!syncHistory.length) return {};
    
    const stats = {
      totalSyncs: syncHistory.length,
      successfulSyncs: syncHistory.filter(log => log.status === 'success').length,
      failedSyncs: syncHistory.filter(log => log.status === 'failed').length,
      totalRecords: syncHistory.reduce((sum, log) => sum + (log.record_count || 0), 0),
      avgDuration: syncHistory.reduce((sum, log) => sum + (log.duration_seconds || 0), 0) / syncHistory.length,
      lastSync: syncHistory[0]?.created_at,
      successRate: syncHistory.length > 0 ? (syncHistory.filter(log => log.status === 'success').length / syncHistory.length) * 100 : 0
    };
    return stats;
  }, [syncHistory]);

  const fetchDataSource = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await integrationApi.getDataSource(id);
      setDataSource(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data source:', err);
      setError('Failed to load data source. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchSyncHistory = useCallback(async () => {
    if (!id) return;
    
    try {
      const response = await integrationApi.getSyncHistoryByDataSource(id);
      setSyncHistory(response.data || []);
    } catch (err) {
      console.error('Error fetching sync history:', err);
    }
  }, [id]);

  const fetchSyncStats = useCallback(async () => {
    if (!id) return;
    
    try {
      const response = await integrationApi.getDataSourceSyncStats(id);
      setSyncStats(response.data || {});
    } catch (err) {
      console.error('Error fetching sync stats:', err);
    }
  }, [id]);

  useEffect(() => {
    fetchDataSource();
    fetchSyncHistory();
    fetchSyncStats();
  }, [fetchDataSource, fetchSyncHistory, fetchSyncStats]);

  // Real-time status updates
  useEffect(() => {
    if (!dataSource) return;
    
    const intervalId = setInterval(async () => {
      try {
        const response = await integrationApi.getDataSource(id);
        const updatedDataSource = response.data;
        
        if (updatedDataSource.status !== dataSource.status) {
          setDataSource(updatedDataSource);
          setRealTimeStatus({
            type: 'status_change',
            message: `Status changed from ${dataSource.status} to ${updatedDataSource.status}`,
            timestamp: new Date().toISOString()
          });
          
          // Clear the notification after 5 seconds
          setTimeout(() => setRealTimeStatus(null), 5000);
        }
      } catch (err) {
        console.error('Error checking data source status:', err);
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [dataSource, id]);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await integrationApi.testConnection(id);
      setTestResult({
        success: true,
        message: 'Connection test successful!',
        data: result.data
      });
      // Refresh data source to show updated status
      fetchDataSource();
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || 'Connection test failed. Please check your configuration.',
        data: null
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await integrationApi.syncDataSource(id);
      setRealTimeStatus({
        type: 'sync_initiated',
        message: 'Synchronization initiated successfully',
        timestamp: new Date().toISOString()
      });
      
      // Refresh data and clear notification after 3 seconds
      setTimeout(() => {
        fetchDataSource();
        fetchSyncHistory();
        setRealTimeStatus(null);
      }, 3000);
    } catch (err) {
      console.error('Error initiating sync:', err);
      setRealTimeStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to initiate sync. Please try again.',
        timestamp: new Date().toISOString()
      });
      setTimeout(() => setRealTimeStatus(null), 5000);
    } finally {
      setSyncing(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await integrationApi.updateDataSourceStatus(id, newStatus);
      setDataSource({ ...dataSource, status: newStatus });
      setRealTimeStatus({
        type: 'status_change',
        message: `Status updated to ${newStatus}`,
        timestamp: new Date().toISOString()
      });
      setTimeout(() => setRealTimeStatus(null), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setRealTimeStatus({
        type: 'error',
        message: 'Failed to update status. Please try again.',
        timestamp: new Date().toISOString()
      });
      setTimeout(() => setRealTimeStatus(null), 5000);
    }
  };

  const handleDelete = async () => {
    try {
      await integrationApi.deleteDataSource(id);
      navigate('/integration');
    } catch (err) {
      console.error('Error deleting data source:', err);
      setRealTimeStatus({
        type: 'error',
        message: 'Failed to delete data source. Please try again.',
        timestamp: new Date().toISOString()
      });
      setTimeout(() => setRealTimeStatus(null), 5000);
    }
  };

  const handleRefresh = () => {
    fetchDataSource();
    fetchSyncHistory();
    fetchSyncStats();
    setRealTimeStatus({
      type: 'refresh',
      message: 'Data refreshed successfully',
      timestamp: new Date().toISOString()
    });
    setTimeout(() => setRealTimeStatus(null), 3000);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <MdCheckCircle className="w-5 h-5 text-green-500" />;
      case 'inactive':
        return <MdPause className="w-5 h-5 text-gray-500" />;
      case 'pending':
        return <MdSchedule className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <MdError className="w-5 h-5 text-red-500" />;
      default:
        return <MdInfo className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatConnectionConfig = (config) => {
    if (!config) return 'No configuration';
    
    const sensitiveFields = ['password', 'api_key', 'client_secret', 'token', 'secret'];
    const formatted = {};
    
    Object.entries(config).forEach(([key, value]) => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        formatted[key] = '••••••••';
      } else {
        formatted[key] = value;
      }
    });
    
    return formatted;
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data source details...</p>
        </div>
      </div>
    );
  }

  if (error || !dataSource) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <div className="text-center">
            <MdError className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data Source</h2>
            <p className="text-gray-600 mb-4">{error || 'Data source not found'}</p>
            <Button
              onClick={() => navigate('/integration')}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <MdBackspace className="w-4 h-4" />
              <span>Back to Integration</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Status Notification */}
      {realTimeStatus && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          realTimeStatus.type === 'error' 
            ? 'bg-red-100 border border-red-200 text-red-700' 
            : realTimeStatus.type === 'status_change'
            ? 'bg-blue-100 border border-blue-200 text-blue-700'
            : 'bg-green-100 border border-green-200 text-green-700'
        }`}>
          <div className="flex items-center space-x-2">
            {realTimeStatus.type === 'error' ? (
              <MdError className="w-5 h-5" />
            ) : realTimeStatus.type === 'status_change' ? (
              <MdInfo className="w-5 h-5" />
            ) : (
              <MdCheckCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{realTimeStatus.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{dataSource.name}</h1>
            <div className="flex items-center space-x-2">
              {getStatusIcon(dataSource.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(dataSource.status)}`}>
                {dataSource.status}
              </span>
            </div>
          </div>
          <p className="text-gray-600 text-lg">{dataSource.description}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {dataSource.type}
            </span>
            {dataSource.module?.module_name && (
              <span className="text-sm text-gray-500">
                Module: {dataSource.module.module_name}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <MdRefresh className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          <Button
            onClick={() => navigate('/dashboard/dashboard/integration/data-sync')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <MdBackspace className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <Button
            onClick={() => navigate(`/dashboard/integration/edit-source/${id}`)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <MdEdit className="w-4 h-4" />
            <span>Edit</span>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MdHistory className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Syncs</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalSyncs || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MdCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.successRate?.toFixed(1) || 0}%</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MdStorage className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalRecords || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MdSpeed className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(statistics.avgDuration)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Panel */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Actions</h2>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={dataSource.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="border rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleTestConnection}
            disabled={testing}
            className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50"
          >
            <MdCastConnected className="w-4 h-4" />
            <span>{testing ? 'Testing...' : 'Test Connection'}</span>
          </Button>
          
          <Button
            onClick={handleSync}
            disabled={syncing || dataSource.status !== 'active'}
            className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
            title={dataSource.status !== 'active' ? 'Data source must be active to sync' : 'Sync now'}
          >
            {syncing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <MdSync className="w-4 h-4" />
            )}
            <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
          </Button>
        </div>

        {testResult && (
          <div className={`mt-6 border px-4 py-3 rounded ${
            testResult.success 
              ? 'bg-green-100 border-green-400 text-green-700' 
              : 'bg-red-100 border-red-400 text-red-700'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {testResult.success ? (
                <MdCheckCircle className="w-5 h-5" />
              ) : (
                <MdError className="w-5 h-5" />
              )}
              <p className="font-semibold">{testResult.message}</p>
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
      </Card>

      {/* Tabs */}
      <Card className="overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['overview', 'connection', 'mapping', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{dataSource.name || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{dataSource.type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900">{dataSource.description || 'No description'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Module Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{dataSource.module?.module_name || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Fact/Dim Tables</dt>
                    <dd className="mt-1 text-sm text-gray-900">{dataSource.module?.fact_tables || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Sync Frequency</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {dataSource.sync_frequency ? `${Math.floor(dataSource.sync_frequency / 3600)} hours` : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Sync</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDateTime(dataSource.last_sync)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDateTime(dataSource.created_at)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'connection' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Configuration</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(formatConnectionConfig(dataSource.connection_config), null, 2)}
                  </pre>
                </div>
              </div>
              {dataSource.query && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Query</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <code className="text-sm block whitespace-pre-wrap">{dataSource.query}</code>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'mapping' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Mapping Rules</h3>
              <MappingRuleList dataSourceId={id} />
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync History</h3>
              <DataSourceSyncHistory dataSourceId={id} />
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Data Source"
      >
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <MdError className="w-8 h-8 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Are you sure?</h3>
              <p className="text-gray-600">This action cannot be undone.</p>
            </div>
          </div>
          <p className="text-gray-700 mb-6">
            This will permanently delete the data source <strong>"{dataSource.name}"</strong> and all associated data.
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

export default DataSourceDetails;