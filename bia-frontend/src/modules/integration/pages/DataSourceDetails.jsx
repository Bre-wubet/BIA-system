import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as integrationApi from '../../../api/integrationApi';
import MappingRuleList from '../components/MappingRuleList';
import DataSourceSyncHistory from '../components/DataSyncLogByDatasourceId';
import Button from '../../../components/ui/Button';
import { MdDelete, MdEdit, MdSync, MdBackspace, MdCastConnected} from "react-icons/md";

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

  useEffect(() => {
    if (id) {
      fetchDataSource();
    }
  }, [id]);

  const fetchDataSource = async () => {
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
  };

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
      alert('Sync initiated successfully!');
      // Refresh data source
      fetchDataSource();
    } catch (err) {
      console.error('Error initiating sync:', err);
      alert(err.response?.data?.message || 'Failed to initiate sync. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await integrationApi.updateDataSourceStatus(id, newStatus);
      setDataSource({ ...dataSource, status: newStatus });
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this data source? This action cannot be undone.')) {
      try {
        await integrationApi.deleteDataSource(id);
        navigate('/integration');
      } catch (err) {
        console.error('Error deleting data source:', err);
        alert('Failed to delete data source. Please try again.');
      }
    }
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

  const formatConnectionConfig = (config) => {
    if (!config) return 'No configuration';
    
    const sensitiveFields = ['password', 'api_key', 'client_secret', 'token'];
    const formatted = {};
    
    Object.entries(config).forEach(([key, value]) => {
      if (sensitiveFields.includes(key.toLowerCase())) {
        formatted[key] = '••••••••';
      } else {
        formatted[key] = value;
      }
    });
    
    return formatted;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading data source...</div>;
  }

  if (error || !dataSource) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Data source not found'}
        </div>
        <Button
          onClick={() => navigate('/integration')}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          variant='outline'
        >
          Back to Integration
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl text-green-900 font-bold">{dataSource.name}</h1>
          <p className="text-gray-600">{dataSource.description}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => navigate('/integration/data-sync')}
            className="hover:bg-blue-200 text-green-900 px-4 py-2 rounded"
            variant='outline'
          >
            Back
          </Button>
          <Button
            onClick={() => navigate(`/integration/edit-source/${id}`)}
            variant='outline'
            className="text-blue-700 px-4 py-2 rounded hover:bg-blue-200"
          >
            <MdEdit className='w-4 h-4 text-blue-700 font-extrabold'/>
          </Button>
          <Button
            onClick={handleDelete}
            variant='outline'
            className="text-red-700 px-4 py-2 rounded hover:bg-red-200"
          >
            <MdDelete className='w-4 h-4 text-red-700 font-bold'/>
          </Button>
        </div>
      </div>

      {/* Status and Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(dataSource.status)}`}>
              {dataSource.status}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
              {dataSource.type}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleTestConnection}
              disabled={testing}
              className="bg-yellow-500 hover:bg-yellow-600 text-green-800 px-4 py-2 rounded disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button
              onClick={handleSync}
              disabled={syncing || dataSource.status !== 'active'}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              title={dataSource.status !== 'active' ? 'Data source must be active to sync' : 'Sync now'}
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </div>

        {testResult && (
          <div className={`border px-4 py-3 rounded mb-4 ${
            testResult.success 
              ? 'bg-green-100 border-green-400 text-green-700' 
              : 'bg-red-100 border-red-400 text-red-700'
          }`}>
            <p className="font-semibold">{testResult.message}</p>
            {testResult.data && (
              <div className="mt-2 text-sm">
                <pre className="bg-white bg-opacity-50 p-2 rounded">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2x text-gray-900">
              {dataSource.sync_frequency ? Math.floor(dataSource.sync_frequency / 3600) : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Hours between syncs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-gray-900">
              {dataSource.last_sync ? new Date(dataSource.last_sync).toLocaleDateString() : 'Never'}
            </div>
            <div className="text-sm text-gray-600">Last synced</div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-gray-900">
              {dataSource.created_at ? new Date(dataSource.created_at).toLocaleDateString() : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Created</div>
          </div>
        </div>

        {/* Status Change */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={dataSource.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg py-2">
        <div>
          <nav className="flex space-x-8 px-1">
            {['overview', 'connection', 'mapping', 'history'].map((tab) => (
              <Button
                key={tab}
                onClick={() => setActiveTab(tab)}
                variant='outline'
                className={`px-1 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-green-500 text-green-950'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Basic Information</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900">{dataSource.name || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="text-sm text-gray-900">{dataSource.type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="text-sm text-gray-900">{dataSource.description || 'No description'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Module_Name</dt>
                    <dd className="text-sm text-gray-900">{dataSource.module?.module_name || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Fact/Dim Table</dt>
                    <dd className="text-sm text-gray-900">{dataSource.module?.fact_tables || 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'connection' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Connection Configuration</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(formatConnectionConfig(dataSource.connection_config), null, 2)}
                  </pre>
                </div>
              </div>
              {dataSource.query && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Query</h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <code className="text-sm">{dataSource.query}</code>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'mapping' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Field Mapping Rules</h3>
              <MappingRuleList dataSourceId={id} />
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Sync History</h3>
              <DataSourceSyncHistory dataSourceId={id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataSourceDetails;