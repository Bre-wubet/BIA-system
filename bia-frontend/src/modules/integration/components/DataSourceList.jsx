import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as integrationApi from '../../../api/integrationApi';

const DataSourceList = () => {
  const navigate = useNavigate();
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSources, setSelectedSources] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [syncQueue, setSyncQueue] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);

  useEffect(() => {
    fetchDataSources();
    fetchSyncStatus();
    fetchSyncQueue();
  }, []);

  const fetchDataSources = async () => {
    setLoading(true);
    try {
      const response = await integrationApi.getAllDataSources();
      setDataSources(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching data sources:', err);
      setError('Failed to load data sources. Please try again.');
      setDataSources([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const response = await integrationApi.getSyncStatus();
      setSyncStatus(response);
    } catch (err) {
      console.error('Error fetching sync status:', err);
    }
  };

  const fetchSyncQueue = async () => {
    try {
      const response = await integrationApi.getSyncQueue();
      setSyncQueue(response.queue || []);
    } catch (err) {
      console.error('Error fetching sync queue:', err);
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this data source?')) {
      try {
        await integrationApi.deleteDataSource(id);
        setDataSources(dataSources.filter(source => source.id !== id));
      } catch (err) {
        console.error('Error deleting data source:', err);
        alert('Failed to delete data source. Please try again.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSources.length === 0) {
      alert('Please select at least one data source to delete.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedSources.length} data source(s)?`)) {
      try {
        // Perform bulk delete operation
        await Promise.all(selectedSources.map(id => integrationApi.deleteDataSource(id)));
        setDataSources(dataSources.filter(source => !selectedSources.includes(source.id)));
        setSelectedSources([]);
      } catch (err) {
        console.error('Error performing bulk delete:', err);
        alert('Failed to delete some data sources. Please try again.');
      }
    }
  };

  const handleTestConnection = async (id) => {
    try {
      const result = await integrationApi.testConnection(id);
      alert(result.message || 'Connection test successful!');
      // Refresh the data source to show updated status
      fetchDataSources();
    } catch (err) {
      console.error('Error testing connection:', err);
      alert(err.response?.data?.message || 'Connection test failed. Please check your connection details.');
    }
  };

  const handleSyncNow = async (id) => {
    try {
      await integrationApi.syncDataSource(id);
      alert('Sync initiated successfully!');
      // Refresh sync queue and status
      fetchSyncQueue();
      fetchSyncStatus();
    } catch (err) {
      console.error('Error initiating sync:', err);
      alert(err.response?.data?.message || 'Failed to initiate sync. Please try again.');
    }
  };

  const handleBatchTestConnections = async () => {
    if (selectedSources.length === 0) {
      alert('Please select at least one data source to test.');
      return;
    }

    setBatchLoading(true);
    try {
      const result = await integrationApi.testMultipleConnections(selectedSources);
      const successCount = result.results.filter(r => r.success).length;
      const failureCount = result.results.length - successCount;
      
      alert(`Batch connection test completed!\nSuccessful: ${successCount}\nFailed: ${failureCount}`);
      
      // Refresh data sources to show updated statuses
      fetchDataSources();
    } catch (err) {
      console.error('Error performing batch connection test:', err);
      alert('Failed to perform batch connection test. Please try again.');
    } finally {
      setBatchLoading(false);
    }
  };

  const handleBatchSync = async () => {
    if (selectedSources.length === 0) {
      alert('Please select at least one data source to sync.');
      return;
    }

    setBatchLoading(true);
    try {
      const result = await integrationApi.syncMultipleDataSources(selectedSources);
      const successCount = result.results.filter(r => r.success).length;
      const failureCount = result.results.length - successCount;
      
      alert(`Batch sync completed!\nSuccessful: ${successCount}\nFailed: ${failureCount}`);
      
      // Refresh sync queue and status
      fetchSyncQueue();
      fetchSyncStatus();
    } catch (err) {
      console.error('Error performing batch sync:', err);
      alert('Failed to perform batch sync. Please try again.');
    } finally {
      setBatchLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredDataSources.map(source => source.id);
      setSelectedSources(allIds);
    } else {
      setSelectedSources([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedSources.includes(id)) {
      setSelectedSources(selectedSources.filter(sourceId => sourceId !== id));
    } else {
      setSelectedSources([...selectedSources, id]);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await integrationApi.updateDataSourceStatus(id, newStatus);
      // Update local state
      setDataSources(dataSources.map(source => 
        source.id === id ? { ...source, status: newStatus } : source
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  // Apply sorting
  const sortedDataSources = [...dataSources].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Apply filtering
  const filteredDataSources = sortedDataSources.filter(source => {
    const matchesStatus = filterStatus === 'all' || source.status === filterStatus;
    const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          source.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (source.description && source.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

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

  const getSyncStatusBadge = (source) => {
    const queueItem = syncQueue.find(item => item.data_source_id === source.id);
    if (queueItem) {
      switch (queueItem.status) {
        case 'pending':
          return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Queued</span>;
        case 'in_progress':
          return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Syncing</span>;
        case 'success':
          return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Synced</span>;
        default:
          return null;
      }
    }
    return null;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading data sources...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header with batch operations */}
      <div className="p-4 border-b flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold">Data Sources</h2>
          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
            {filteredDataSources.length} sources
          </span>
          {syncStatus && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              {syncStatus.active_sources || 0} active
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/integration/new-source')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Source
          </button>
          
          {selectedSources.length > 0 && (
            <>
              <button
                onClick={handleBatchTestConnections}
                disabled={batchLoading}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm flex items-center disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Test Selected
              </button>
              <button
                onClick={handleBatchSync}
                disabled={batchLoading}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm flex items-center disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Sync Selected
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Delete Selected
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="p-4 border-b flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="error">Error</option>
          </select>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search data sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded pl-8 pr-3 py-1 text-sm w-64"
          />
          <svg className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
      
      {/* Sync Queue Summary */}
      {syncQueue.length > 0 && (
        <div className="p-4 border-b bg-blue-50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-blue-800">Sync Queue Status</h3>
            <button
              onClick={fetchSyncQueue}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Refresh
            </button>
          </div>
          <div className="mt-2 flex space-x-4 text-sm text-blue-700">
            <span>Pending: {syncQueue.filter(item => item.status === 'pending').length}</span>
            <span>In Progress: {syncQueue.filter(item => item.status === 'in_progress').length}</span>
            <span>Completed: {syncQueue.filter(item => item.status === 'success').length}</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      )}
      
      {filteredDataSources.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {searchTerm || filterStatus !== 'all' ? (
            <p>No data sources match your filters. Try adjusting your search criteria.</p>
          ) : (
            <div>
              <p className="mb-4">No data sources found.</p>
              <button
                onClick={() => navigate('/integration/new-source')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add Your First Data Source
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedSources.length === filteredDataSources.length && filteredDataSources.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    {sortConfig.key === 'name' && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortConfig.direction === 'ascending' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}></path>
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center">
                    Type
                    {sortConfig.key === 'type' && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortConfig.direction === 'ascending' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}></path>
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortConfig.key === 'status' && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortConfig.direction === 'ascending' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}></path>
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('last_sync')}
                >
                  <div className="flex items-center">
                    Last Sync
                    {sortConfig.key === 'last_sync' && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortConfig.direction === 'ascending' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}></path>
                      </svg>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDataSources.map((source) => (
                <tr key={source.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedSources.includes(source.id)}
                      onChange={() => handleSelectOne(source.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{source.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{source.description}</div>
                    {getSyncStatusBadge(source)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{source.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(source.status)}`}>
                        {source.status}
                      </span>
                      <select
                        value={source.status}
                        onChange={(e) => handleStatusChange(source.id, e.target.value)}
                        className="text-xs border rounded px-1 py-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                        <option value="error">Error</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {source.last_sync ? new Date(source.last_sync).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleTestConnection(source.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Test Connection"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleSyncNow(source.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Sync Now"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => navigate(`/integration/edit-source/${source.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(source.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DataSourceList;