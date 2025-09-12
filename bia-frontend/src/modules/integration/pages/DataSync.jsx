import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as integrationApi from '../../../api/integrationApi';
import Button from '../../../components/ui/Button';

const DataSync = () => {
  const [dataSources, setDataSources] = useState([]);
  const [syncQueue, setSyncQueue] = useState([]);
  const [syncHistory, setSyncHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedDataSources, setSelectedDataSources] = useState([]);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch data sources
      const sourcesResponse = await integrationApi.getAllDataSources();
      setDataSources(sourcesResponse.data || []);
      
      // Fetch sync queue
      const queueResponse = await integrationApi.getSyncQueue();
      setSyncQueue(queueResponse.data || []);
      
      // Fetch sync history (integration logs)
      const logsResponse = await integrationApi.getIntegrationLogs();
      setSyncHistory(logsResponse.data || []);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching sync data:', err);
      setError('Failed to load synchronization data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Set up polling for sync queue updates
    const intervalId = setInterval(() => {
      integrationApi.getSyncQueue()
        .then(response => setSyncQueue(response.data || []))
        .catch(err => console.error('Error polling sync queue:', err));
    }, 10000); // Poll every 10 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  const handleSyncDataSource = async (id) => {
    try {
      setError(null);
      setSuccess(null);
      const response = await integrationApi.syncDataSource(id);
      setSuccess(`Data source sync initiated: ${response.message || 'Success'}`);
      // Refresh the queue
      const queueResponse = await integrationApi.getSyncQueue();
      setSyncQueue(queueResponse.data || []);
    } catch (err) {
      console.error(`Error syncing data source ${id}:`, err);
      setError('Failed to sync data source. Please try again later.');
    }
  };

  const handleSyncSelected = async () => {
    if (selectedDataSources.length === 0) {
      setError('Please select at least one data source to sync');
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      await integrationApi.syncMultipleDataSources(selectedDataSources);
      setSuccess(`Batch sync initiated for ${selectedDataSources.length} data sources`);
      setSelectedDataSources([]);
      // Refresh the queue
      const queueResponse = await integrationApi.getSyncQueue();
      setSyncQueue(queueResponse.data || []);
    } catch (err) {
      console.error('Error syncing selected data sources:', err);
      setError('Failed to sync selected data sources. Please try again later.');
    }
  };

  const handleSyncAll = async () => {
    try {
      setError(null);
      setSuccess(null);
        await integrationApi.syncMultipleDataSources(
        dataSources.filter(ds => ds.status === 'active').map(ds => ds.id)
      );
      setSuccess('Sync initiated for all active data sources');
      // Refresh the queue
      const queueResponse = await integrationApi.getSyncQueue();
      setSyncQueue(queueResponse.data || []);
    } catch (err) {
      console.error('Error syncing all data sources:', err);
      setError('Failed to sync all data sources. Please try again later.');
    }
  };
  
  const handleToggleSelect = (id) => {
    setSelectedDataSources(prev => {
      if (prev.includes(id)) {
        return prev.filter(dsId => dsId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectedDataSources.length === dataSources.filter(ds => ds.status === 'active').length) {
      setSelectedDataSources([]);
    } else {
      setSelectedDataSources(dataSources.filter(ds => ds.status === 'active').map(ds => ds.id));
    }
  };
  
  const handleRefresh = () => {
    fetchData();
    setSuccess('Data refreshed successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'queued':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-4">Loading synchronization data...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-900">Data Synchronization</h1>
        <div className="space-x-2">
          <Button 
            onClick={handleRefresh} 
            className="px-4 py-2 hover:bg-blue-800"
            variant='primary'
          >
            Refresh
          </Button>
          <Button 
            onClick={() => navigate('/integration')} 
            className="px-4 py-2 text-green-950 hover:bg-blue-100"
            variant='outline'
          >
            Back to Integration
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Data Sources */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Data Sources</h2>
          <div className="space-x-2">
            <button 
              onClick={handleSelectAll} 
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              {selectedDataSources.length === dataSources.filter(ds => ds.status === 'active').length ? 'Deselect All' : 'Select All Active'}
            </button>
            <Button 
              onClick={handleSyncSelected} 
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              variant='primary'
              disabled={selectedDataSources.length === 0}
            >
              Sync Selected ({selectedDataSources.length})
            </Button>
            <Button 
              onClick={handleSyncAll} 
              className="px-3 py-1 hover:bg-blue-700 text-gray-50"
              variant='success'
            >
              Sync All Active
            </Button>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedDataSources.length > 0 && selectedDataSources.length === dataSources.filter(ds => ds.status === 'active').length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store Table</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Synced</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataSources.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No data sources found.
                  </td>
                </tr>
              ) : (
                dataSources.map((source) => {
                  // Find the latest sync history for this data source
                  const latestSync = syncHistory.find(sh => sh.data_source_id === source.id);
                  return (
                    <tr key={source.id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          checked={selectedDataSources.includes(source.id)}
                          onChange={() => handleToggleSelect(source.id)}
                          disabled={source.status !== 'active'}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{source.name}</div>
                        <div className="text-xs text-gray-500">{source.module?.module_name || 'No module'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {source.module?.fact_tables || 'No module'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {source.type}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          source.status === 'active' ? 'bg-green-100 text-green-800' : 
                          source.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {source.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {latestSync ? formatDateTime(latestSync.sync_date) : 'Never'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleSyncDataSource(source.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          disabled={source.status !== 'active'}
                        >
                          Sync Now
                        </button>
                        <button 
                          onClick={() => navigate(`/integration/view/${source.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Current Sync Queue */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Sync Queue</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Queued At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {syncQueue.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No active synchronization tasks.
                  </td>
                </tr>
              ) : (
                syncQueue.map((task) => {
                  const dataSource = dataSources.find(ds => ds.id === task.data_source_id) || {};
                  return (
                    <tr key={task.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{dataSource.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{dataSource.type || 'Unknown type'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(task.queued_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(task.started_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {task.status === 'queued' && (
                          <button 
                            onClick={() => handleSyncDataSource(task.data_source_id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Prioritize
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync History */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Synchronization History</h2>
          <button 
            onClick={() => navigate('/integration/sync-history')} 
            className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
          >
            View Full History
          </button>
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {syncHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No synchronization history available.
                  </td>
                </tr>
              ) : (
                syncHistory.map((log) => {
                  const dataSource = dataSources.find(ds => ds.id === log.data_source_id) || {};
                  return (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{dataSource.name || log.source_system}</div>
                        <div className="text-sm text-gray-500">{dataSource.type || 'Unknown type'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(log.run_timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.record_count !== undefined ? log.record_count : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => alert(log.message || 'No additional details available')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataSync;