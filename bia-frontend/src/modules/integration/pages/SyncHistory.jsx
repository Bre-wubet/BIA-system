import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as integrationApi from '../../../api/integrationApi';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Modal from '../../../components/ui/Modal';
import { 
  MdRefresh, 
  MdFilterList, 
  MdSearch, 
  MdDownload, 
  MdVisibility, 
  MdCheckCircle, 
  MdError, 
  MdSchedule,
  MdInfo,
  MdExpandMore,
  MdExpandLess,
  MdCalendarToday,
  MdTrendingUp,
  MdTrendingDown
} from 'react-icons/md';

const SyncHistory = () => {
  const [syncHistory, setSyncHistory] = useState([]);
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [logRecords, setLogRecords] = useState({}); // { [logId]: { loading, error, data, page, total, totalPages } }
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    dataSourceId: '',
    startDate: '',
    endDate: '',
    searchTerm: ''
  });
  
  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    minRecords: '',
    maxRecords: '',
    minDuration: '',
    maxDuration: '',
    hasErrors: false
  });
  
  const navigate = useNavigate();

  // Memoized filtered and paginated data
  const processedData = useMemo(() => {
    let filtered = syncHistory;

    // Apply basic filters
    if (filters.status) {
      filtered = filtered.filter(log => log.status === filters.status);
    }
    if (filters.dataSourceId) {
      filtered = filtered.filter(log => log.data_source_id === parseInt(filters.dataSourceId));
    }
    if (filters.startDate) {
      filtered = filtered.filter(log => new Date(log.run_timestamp) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(log => new Date(log.run_timestamp) <= new Date(filters.endDate + 'T23:59:59'));
    }
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(log => {
        const dataSource = dataSources.find(ds => ds.id === log.data_source_id);
        return (
          (dataSource?.name || '').toLowerCase().includes(searchLower) ||
          (log.message || '').toLowerCase().includes(searchLower) ||
          (log.source_system || '').toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply advanced filters
    if (advancedFilters.minRecords) {
      filtered = filtered.filter(log => (log.record_count || 0) >= parseInt(advancedFilters.minRecords));
    }
    if (advancedFilters.maxRecords) {
      filtered = filtered.filter(log => (log.record_count || 0) <= parseInt(advancedFilters.maxRecords));
    }
    if (advancedFilters.minDuration) {
      filtered = filtered.filter(log => (log.duration_seconds || 0) >= parseInt(advancedFilters.minDuration));
    }
    if (advancedFilters.maxDuration) {
      filtered = filtered.filter(log => (log.duration_seconds || 0) <= parseInt(advancedFilters.maxDuration));
    }
    if (advancedFilters.hasErrors) {
      filtered = filtered.filter(log => log.status === 'failed' || (log.message && log.message.toLowerCase().includes('error')));
    }

    return filtered;
  }, [syncHistory, dataSources, filters, advancedFilters]);

  // Memoized statistics
  const statistics = useMemo(() => {
    const stats = {
      total: processedData.length,
      success: processedData.filter(log => log.status === 'success').length,
      failed: processedData.filter(log => log.status === 'failed').length,
      inProgress: processedData.filter(log => log.status === 'in_progress').length,
      totalRecords: processedData.reduce((sum, log) => sum + (log.record_count || 0), 0),
      avgDuration: processedData.reduce((sum, log) => sum + (log.duration_seconds || 0), 0) / processedData.length || 0,
      successRate: processedData.length > 0 ? (processedData.filter(log => log.status === 'success').length / processedData.length) * 100 : 0
    };
    return stats;
  }, [processedData]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data sources for filtering
      const sourcesResponse = await integrationApi.getAllDataSources();
      setDataSources(sourcesResponse.data || []);
      
      // Fetch paginated sync history
      const logsResponse = await integrationApi.getPaginatedIntegrationLogs(
        currentPage,
        itemsPerPage,
        filters
      );
      
      setSyncHistory(logsResponse.data || []);
      setTotalPages(logsResponse.totalPages || 1);
      setTotalItems(logsResponse.totalItems || 0);
    } catch (err) {
      console.error('Error fetching sync history:', err);
      setError('Failed to load synchronization history. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData();
    setSuccess('Data refreshed successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const handleAdvancedFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdvancedFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      dataSourceId: '',
      startDate: '',
      endDate: '',
      searchTerm: ''
    });
    setAdvancedFilters({
      minRecords: '',
      maxRecords: '',
      minDuration: '',
      maxDuration: '',
      hasErrors: false
    });
    setCurrentPage(1);
  };

  const handleExportHistory = async () => {
    try {
      const response = await integrationApi.exportSyncHistory(filters);
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

  const handleSelectLog = (logId) => {
    setSelectedLogs(prev => {
      if (prev.includes(logId)) {
        return prev.filter(id => id !== logId);
      } else {
        return [...prev, logId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedLogs.length === processedData.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(processedData.map(log => log.id));
    }
  };

  const loadLogRecords = async (logId, page = 1, limit = 50) => {
    try {
      setLogRecords(prev => ({ ...prev, [logId]: { ...(prev[logId] || {}), loading: true, error: null } }));
      const res = await integrationApi.getLogRecordsByLogId(logId, page, limit);
      setLogRecords(prev => ({
        ...prev,
        [logId]: {
          loading: false,
          error: null,
          data: res.data || [],
          page: res.pagination?.page || page,
          total: res.pagination?.total || 0,
          totalPages: res.pagination?.totalPages || 1,
          limit: res.pagination?.limit || limit
        }
      }));
    } catch (err) {
      console.error('Failed to load log records', err);
      setLogRecords(prev => ({ ...prev, [logId]: { ...(prev[logId] || {}), loading: false, error: 'Failed to load records' } }));
    }
  };

  const toggleRowExpansion = (logId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
        // Lazy-load records on first expand
        if (!logRecords[logId] || !logRecords[logId].data) {
          loadLogRecords(logId);
        }
      }
      return newSet;
    });
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

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <MdCheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <MdError className="w-4 h-4 text-red-500" />;
      case 'in_progress':
        return <MdSchedule className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'queued':
        return <MdSchedule className="w-4 h-4 text-yellow-500" />;
      default:
        return <MdInfo className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded text-sm font-medium ${
            currentPage === i 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            First
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Prev
          </button>
          
          {pages}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Next
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Last
          </button>
        </div>
        
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages} ({totalItems} total items)
        </span>
      </div>
    );
  };

  if (loading && syncHistory.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading synchronization history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Synchronization History</h1>
          <p className="text-gray-600 mt-1">View and analyze data synchronization logs</p>
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
            onClick={() => navigate('/integration/data-sync')} 
            variant="outline"
            className="flex items-center space-x-2"
          >
            <MdVisibility className="w-4 h-4" />
            <span>Back to Data Sync</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MdInfo className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Syncs</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MdCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Successful</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.success}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <MdError className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.failed}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MdTrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.successRate.toFixed(1)}%</p>
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

      {/* Filters */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <MdFilterList className="w-4 h-4" />
              <span>Advanced</span>
              {showAdvancedFilters ? <MdExpandLess className="w-4 h-4" /> : <MdExpandMore className="w-4 h-4" />}
            </Button>
            <Button
              onClick={handleClearFilters}
              variant="outline"
              size="sm"
            >
              Clear All
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                name="searchTerm"
                value={filters.searchTerm}
                onChange={handleFilterChange}
                placeholder="Search logs..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="in_progress">In Progress</option>
              <option value="queued">Queued</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
            <select
              name="dataSourceId"
              value={filters.dataSourceId}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Data Sources</option>
              {dataSources.map(source => (
                <option key={source.id} value={source.id}>{source.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <div className="relative">
              <MdCalendarToday className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <div className="relative">
              <MdCalendarToday className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-md font-medium text-gray-900 mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Records</label>
                <input
                  type="number"
                  name="minRecords"
                  value={advancedFilters.minRecords}
                  onChange={handleAdvancedFilterChange}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Records</label>
                <input
                  type="number"
                  name="maxRecords"
                  value={advancedFilters.maxRecords}
                  onChange={handleAdvancedFilterChange}
                  placeholder="1000000"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Duration (sec)</label>
                <input
                  type="number"
                  name="minDuration"
                  value={advancedFilters.minDuration}
                  onChange={handleAdvancedFilterChange}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Duration (sec)</label>
                <input
                  type="number"
                  name="maxDuration"
                  value={advancedFilters.maxDuration}
                  onChange={handleAdvancedFilterChange}
                  placeholder="3600"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="hasErrors"
                  checked={advancedFilters.hasErrors}
                  onChange={handleAdvancedFilterChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Only show logs with errors</span>
              </label>
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end space-x-2">
          <Button
            onClick={handleExportHistory}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <MdDownload className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          <Button
            onClick={fetchData}
            variant="primary"
          >
            Apply Filters
          </Button>
        </div>
      </Card>

      {/* Sync History Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Synchronization History</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Showing {processedData.length} of {totalItems} logs
            </span>
            {selectedLogs.length > 0 && (
              <Button
                onClick={() => setSelectedLogs([])}
                variant="outline"
                size="sm"
              >
                Clear Selection ({selectedLogs.length})
              </Button>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedLogs.length > 0 && selectedLogs.length === processedData.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <MdInfo className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No synchronization history found</p>
                    <p className="text-sm">Try adjusting your search or filter criteria</p>
                  </td>
                </tr>
              ) : (
                processedData.map((log) => {
                  const dataSource = dataSources.find(ds => ds.id === log.data_source_id) || {};
                  const isExpanded = expandedRows.has(log.id);
                  
                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input 
                            type="checkbox" 
                            checked={selectedLogs.includes(log.id)}
                            onChange={() => handleSelectLog(log.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{dataSource.name || log.source_system}</div>
                              <div className="text-sm text-gray-500">{dataSource.type || 'Unknown type'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(log.status)}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(log.status)}`}>
                              {log.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(log.run_timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDuration(log.duration_seconds)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.record_count !== undefined ? log.record_count.toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button
                            onClick={() => toggleRowExpansion(log.id)}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-1"
                          >
                            {isExpanded ? <MdExpandLess className="w-3 h-3" /> : <MdExpandMore className="w-3 h-3" />}
                            <span>{isExpanded ? 'Less' : 'More'}</span>
                          </Button>
                        </td>
                      </tr>
                      
                      {/* Expanded Row */}
                      {isExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan="7" className="px-6 py-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Details</h4>
                                  <dl className="space-y-1">
                                    <div className="flex justify-between">
                                      <dt className="text-sm text-gray-500">Completed:</dt>
                                      <dd className="text-sm text-gray-900">{formatDateTime(log.created_at)}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                      <dt className="text-sm text-gray-500">Source System:</dt>
                                      <dd className="text-sm text-gray-900">{log.source_system || 'N/A'}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                      <dt className="text-sm text-gray-500">Duration:</dt>
                                      <dd className="text-sm text-gray-900">{formatDuration(log.duration_seconds)}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                      <dt className="text-sm text-gray-500">Records Processed:</dt>
                                      <dd className="text-sm text-gray-900">{log.record_count?.toLocaleString() || 'N/A'}</dd>
                                    </div>
                                  </dl>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Message</h4>
                                  <div className="bg-white p-3 rounded border text-sm text-gray-700">
                                    {log.message || 'No additional details available'}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-sm font-medium text-gray-900">Records</h4>
                                  <div className="text-xs text-gray-500">
                                    {logRecords[log.id]?.total ? `${logRecords[log.id].total} total` : ''}
                                  </div>
                                </div>
                                {logRecords[log.id]?.loading && (
                                  <div className="text-sm text-gray-500">Loading records...</div>
                                )}
                                {logRecords[log.id]?.error && (
                                  <div className="text-sm text-red-600">{logRecords[log.id].error}</div>
                                )}
                                {!logRecords[log.id]?.loading && !logRecords[log.id]?.error && (
                                  <div className="overflow-x-auto border rounded">
                                    {Array.isArray(logRecords[log.id]?.data) && logRecords[log.id].data.length > 0 ? (
                                      <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100">
                                          <tr>
                                            {/* Dynamic keys from first record */}
                                            {Object.keys(logRecords[log.id].data[0].record || {}).slice(0, 8).map(key => (
                                              <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{key}</th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                          {logRecords[log.id].data.map(r => (
                                            <tr key={r.id} className="hover:bg-gray-50">
                                              {Object.keys(logRecords[log.id].data[0].record || {}).slice(0, 8).map(key => (
                                                <td key={key} className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                                                  {typeof r.record[key] === 'object' ? JSON.stringify(r.record[key]) : String(r.record[key] ?? '')}
                                                </td>
                                              ))}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    ) : (
                                      <div className="p-3 text-sm text-gray-500">No records to display</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {renderPagination()}
      </Card>
    </div>
  );
};

export default SyncHistory;