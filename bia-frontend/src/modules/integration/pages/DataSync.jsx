import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as integrationApi from '../../../api/integrationApi';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Modal from '../../../components/ui/Modal';
import { 
  MdRefresh, 
  MdSync, 
  MdPlayArrow, 
  MdPause, 
  MdStop, 
  MdCheckCircle, 
  MdError, 
  MdSchedule,
  MdVisibility,
  MdFilterList,
  MdSearch,
  MdDownload,
  MdInfo
} from 'react-icons/md';

const DataSync = () => {
  const [dataSources, setDataSources] = useState([]);
  const [syncQueue, setSyncQueue] = useState([]);
  const [syncHistory, setSyncHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedDataSources, setSelectedDataSources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(true);
  const navigate = useNavigate();

  // Memoized filtered data sources
  const filteredDataSources = useMemo(() => {
    return dataSources.filter(source => {
      const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           source.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || source.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [dataSources, searchTerm, statusFilter]);

  // Memoized sync statistics
  const syncStats = useMemo(() => {
    const stats = {
      total: dataSources.length,
      active: dataSources.filter(ds => ds.status === 'active').length,
      inactive: dataSources.filter(ds => ds.status === 'inactive').length,
      error: dataSources.filter(ds => ds.status === 'error').length,
      queued: syncQueue.length,
      running: syncQueue.filter(task => task.status === 'in_progress').length,
      completed: syncHistory.filter(log => log.status === 'success').length,
      failed: syncHistory.filter(log => log.status === 'failed').length
    };
    return stats;
  }, [dataSources, syncQueue, syncHistory]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [sourcesResponse, queueResponse, logsResponse] = await Promise.all([
        integrationApi.getAllDataSources(),
        integrationApi.getSyncQueue(),
        integrationApi.getIntegrationLogs()
      ]);
      
      setDataSources(sourcesResponse.data || []);
      setSyncQueue(queueResponse.data || []);
      setSyncHistory(logsResponse.data || []);
    } catch (err) {
      console.error('Error fetching sync data:', err);
      setError('Failed to load synchronization data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;
    
    const intervalId = setInterval(() => {
      integrationApi.getSyncQueue()
        .then(response => setSyncQueue(response.data || []))
        .catch(err => console.error('Error polling sync queue:', err));
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [autoRefresh]);

  const handleSyncDataSource = async (id, sourceName) => {
    try {
      setError(null);
      setSuccess(null);
      setSyncProgress(prev => ({ ...prev, [id]: 'starting' }));
      
      const response = await integrationApi.syncDataSource(id);
      setSuccess(`Sync initiated for ${sourceName}`);
      setSyncProgress(prev => ({ ...prev, [id]: 'queued' }));
      
      // Refresh the queue
      const queueResponse = await integrationApi.getSyncQueue();
      setSyncQueue(queueResponse.data || []);
    } catch (err) {
      console.error(`Error syncing data source ${id}:`, err);
      setError(`Failed to sync ${sourceName}. Please try again later.`);
      setSyncProgress(prev => ({ ...prev, [id]: 'error' }));
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
      setShowSyncModal(true);
      
      // Update progress for all selected sources
      selectedDataSources.forEach(id => {
        setSyncProgress(prev => ({ ...prev, [id]: 'starting' }));
      });
      
      await integrationApi.syncMultipleDataSources(selectedDataSources);
      setSuccess(`Batch sync initiated for ${selectedDataSources.length} data sources`);
      setSelectedDataSources([]);
      setShowSyncModal(false);
      
      // Refresh the queue
      const queueResponse = await integrationApi.getSyncQueue();
      setSyncQueue(queueResponse.data || []);
    } catch (err) {
      console.error('Error syncing selected data sources:', err);
      setError('Failed to sync selected data sources. Please try again later.');
      setShowSyncModal(false);
    }
  };

  const handleSyncAll = async () => {
    const activeSources = dataSources.filter(ds => ds.status === 'active');
    if (activeSources.length === 0) {
      setError('No active data sources to sync');
      return;
    }
    
    try {
      setError(null);
      setSuccess(null);
      setShowSyncModal(true);
      
      // Update progress for all active sources
      activeSources.forEach(source => {
        setSyncProgress(prev => ({ ...prev, [source.id]: 'starting' }));
      });
      
      await integrationApi.syncMultipleDataSources(activeSources.map(ds => ds.id));
      setSuccess(`Sync initiated for all ${activeSources.length} active data sources`);
      setShowSyncModal(false);
      
      // Refresh the queue
      const queueResponse = await integrationApi.getSyncQueue();
      setSyncQueue(queueResponse.data || []);
    } catch (err) {
      console.error('Error syncing all data sources:', err);
      setError('Failed to sync all data sources. Please try again later.');
      setShowSyncModal(false);
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
    const activeSources = filteredDataSources.filter(ds => ds.status === 'active');
    if (selectedDataSources.length === activeSources.length) {
      setSelectedDataSources([]);
    } else {
      setSelectedDataSources(activeSources.map(ds => ds.id));
    }
  };
  
  const handleRefresh = () => {
    fetchData();
    setSuccess('Data refreshed successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleExportHistory = async () => {
    try {
      const response = await integrationApi.exportSyncHistory();
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sync-history-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting history:', err);
      setError('Failed to export sync history');
    }
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

  const getProgressIcon = (sourceId) => {
    const progress = syncProgress[sourceId];
    if (!progress) return null;
    
    switch (progress) {
      case 'starting':
        return <MdSchedule className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'queued':
        return <MdSchedule className="w-4 h-4 text-yellow-500" />;
      case 'in_progress':
        return <MdSync className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success':
        return <MdCheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <MdError className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading synchronization data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Synchronization</h1>
          <p className="text-gray-600 mt-1">Manage and monitor data source synchronization</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            className="flex items-center space-x-2"
          >
            <MdRefresh className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          <Button 
            onClick={() => navigate('/integration')} 
            variant="outline"
            className="flex items-center space-x-2"
          >
            <MdVisibility className="w-4 h-4" />
            <span>Back to Integration</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MdSync className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sources</p>
              <p className="text-2xl font-bold text-gray-900">{syncStats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MdCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Sources</p>
              <p className="text-2xl font-bold text-gray-900">{syncStats.active}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <MdSchedule className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Queue</p>
              <p className="text-2xl font-bold text-gray-900">{syncStats.queued}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <MdError className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed Syncs</p>
              <p className="text-2xl font-bold text-gray-900">{syncStats.failed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <MdError className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <MdCheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      {/* Controls */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search data sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="error">Error</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSelectAll}
              variant="outline"
              className="text-sm"
            >
              {selectedDataSources.length === filteredDataSources.filter(ds => ds.status === 'active').length ? 'Deselect All' : 'Select All Active'}
            </Button>
            
            <Button
              onClick={handleSyncSelected}
              variant="primary"
              disabled={selectedDataSources.length === 0}
              className="text-sm flex items-center space-x-2"
            >
              <MdSync className="w-4 h-4" />
              <span>Sync Selected ({selectedDataSources.length})</span>
            </Button>
            
            <Button
              onClick={handleSyncAll}
              variant="success"
              className="text-sm flex items-center space-x-2"
            >
              <MdPlayArrow className="w-4 h-4" />
              <span>Sync All Active</span>
            </Button>
            
            <Button
              onClick={handleExportHistory}
              variant="outline"
              className="text-sm flex items-center space-x-2"
            >
              <MdDownload className="w-4 h-4" />
              <span>Export History</span>
            </Button>
          </div>
        </div>

        {/* Auto-refresh toggle */}
        <div className="mt-4 flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoRefresh"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="autoRefresh" className="text-sm text-gray-700">
            Auto-refresh (every 5 seconds)
          </label>
        </div>
      </Card>

      {/* Data Sources Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Data Sources</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedDataSources.length > 0 && selectedDataSources.length === filteredDataSources.filter(ds => ds.status === 'active').length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Synced</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDataSources.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <MdInfo className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No data sources found</p>
                    <p className="text-sm">Try adjusting your search or filter criteria</p>
                  </td>
                </tr>
              ) : (
                filteredDataSources.map((source) => {
                  const latestSync = syncHistory.find(sh => sh.data_source_id === source.id);
                  return (
                    <tr key={source.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          checked={selectedDataSources.includes(source.id)}
                          onChange={() => handleToggleSelect(source.id)}
                          disabled={source.status !== 'active'}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{source.name}</div>
                            <div className="text-sm text-gray-500">{source.module?.module_name || 'No module'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {source.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          source.status === 'active' ? 'bg-green-100 text-green-800' : 
                          source.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {source.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {latestSync ? formatDateTime(latestSync.sync_date) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getProgressIcon(source.id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          onClick={() => handleSyncDataSource(source.id, source.name)}
                          disabled={source.status !== 'active' || syncProgress[source.id] === 'starting'}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <MdSync className="w-3 h-3" />
                          <span>Sync</span>
                        </Button>
                        <Button
                          onClick={() => navigate(`/dashboard/integration/view/${source.id}`)}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <MdVisibility className="w-3 h-3" />
                          <span>View</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Sync Queue */}
      {syncQueue.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Current Sync Queue</h2>
          </div>
          <div className="overflow-x-auto">
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
                {syncQueue.map((task) => {
                  const dataSource = dataSources.find(ds => ds.id === task.data_source_id) || {};
                  return (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{dataSource.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{dataSource.type || 'Unknown type'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
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
                          <Button
                            onClick={() => handleSyncDataSource(task.data_source_id, dataSource.name)}
                            variant="outline"
                            size="sm"
                          >
                            Prioritize
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Sync History Preview */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Sync History</h2>
          <Button
            onClick={() => navigate('/dashboard/integration/sync-history')}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <MdVisibility className="w-4 h-4" />
            <span>View Full History</span>
          </Button>
        </div>
        <div className="overflow-x-auto">
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
              {syncHistory.slice(0, 5).map((log) => {
                const dataSource = dataSources.find(ds => ds.id === log.data_source_id) || {};
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{dataSource.name || log.source_system}</div>
                      <div className="text-sm text-gray-500">{dataSource.type || 'Unknown type'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(log.status)}`}>
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
                      {log.record_count !== undefined ? log.record_count.toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        onClick={() => alert(log.message || 'No additional details available')}
                        variant="outline"
                        size="sm"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Sync Modal */}
      <Modal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        title="Synchronizing Data Sources"
      >
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-900">Initiating synchronization...</p>
          <p className="text-sm text-gray-600 mt-2">Please wait while we start the sync process</p>
        </div>
      </Modal>
    </div>
  );
};

export default DataSync;