import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAllDataSources,
  getDataSourcesNeedingSync,
  syncDataSource,
  testConnection,
  deleteDataSource,
  syncMultipleDataSources,
  getDataSourcesByModuleAndType,
  getSyncQueue,
  getIntegrationLogs
} from "../../../api/integrationApi";
import MappingRuleList from '../components/MappingRuleList';
import Modal from '../../../components/ui/Modal';
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import Alert from "../../../components/ui/Alert";
import Badge from "../../../components/ui/Badge";
import Tooltip from "../../../components/ui/Tooltip";
import EmptyState from "../../../components/ui/EmptyState";
import SearchInput from "../../../components/ui/SearchInput";
import FilterDropdown from "../../../components/ui/FilterDropdown";
import { 
  MdDelete, 
  MdEdit, 
  MdSync, 
  MdCastConnected, 
  MdQueue, 
  MdList,
  MdRefresh,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdViewModule,
  MdViewList,
  MdMoreVert,
  MdWarning,
  MdCheckCircle,
  MdError,
  MdAnalytics,
  MdSpeed,
  MdSchedule,
  MdVisibility,
  MdContentCopy,
  MdDownload,
  MdSettings,
  MdTrendingUp,
  MdTrendingDown,
  MdHistory,
  MdInsights,
  MdDataUsage,
  MdStorage,
  MdCloudSync,
  MdSyncProblem,
  MdCheckCircleOutline,
  MdRule
} from "react-icons/md";

  const IntegrationPage = () => {
  const defaultFilters = {
    module_name: "",
    type: "",
    status: "",
    sync_frequency_min: "",
    sync_frequency_max: "",
    last_sync_from: "",
    last_sync_to: ""
  };

    const [filters, setFilters] = useState(defaultFilters);
    const [dataSources, setDataSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [syncQueue, setSyncQueue] = useState([]);
    const [activeDataSources, setActiveDataSources] = useState([]);
    const [dataSourcesNeedingSync, setDataSourcesNeedingSync] = useState([]);
    const [showMapping, setShowMapping] = useState(false);
    const [selectedDataSourceId, setSelectedDataSourceId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedDataSource, setSelectedDataSource] = useState(null);
    const [integrationLogs, setIntegrationLogs] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const navigate = useNavigate();

  // fetch data (always driven by filters)
  const fetchDataSources = async (filtersToApply = defaultFilters) => {
    try {
      setLoading(true);
      setError(null);

      const res = await getDataSourcesByModuleAndType(
        filtersToApply.module_name,
        filtersToApply.type
      );

      if (res.success && Array.isArray(res.data)) {
        setDataSources(res.data);
      } else {
        setDataSources([]);
      }
    } catch (err) {
      console.error("Error fetching data sources:", err);
      setError("Failed to fetch data sources.");
      setDataSources([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncQueue = async () => {
    try {
      const queue = await getSyncQueue();
      setSyncQueue(Array.isArray(queue) ? queue : []);
    } catch (err) {
      console.error("Error fetching sync queue:", err);
      setSyncQueue([]);
    }
  };

  const fetchIntegrationLogs = async () => {
    try {
      const logs = await getIntegrationLogs();
      setIntegrationLogs(logs || []);
    } catch (err) {
      console.error("Error fetching integration logs:", err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Calculate analytics from data sources
      const total = dataSources.length;
      const active = dataSources.filter(ds => ds.status === 'active').length;
      const inactive = dataSources.filter(ds => ds.status === 'inactive').length;
      const error = dataSources.filter(ds => ds.status === 'error').length;
      const pending = dataSources.filter(ds => ds.status === 'pending').length;
      
      setAnalytics({
        total,
        active,
        inactive,
        error,
        pending,
        successRate: total > 0 && !isNaN(active) && !isNaN(total) ? ((active / total) * 100).toFixed(1) : 0,
        lastSync: dataSources.reduce((latest, ds) => {
          if (!ds.last_sync) return latest;
          const syncDate = new Date(ds.last_sync);
          return !latest || syncDate > latest ? syncDate : latest;
        }, null)
      });
    } catch (err) {
      console.error("Error calculating analytics:", err);
    }
  };

  useEffect(() => {
    fetchDataSources();
  }, []);

  useEffect(() => {
    if (dataSources.length > 0) {
      fetchSyncQueue();
      fetchIntegrationLogs();
      fetchAnalytics();
    }
  }, [dataSources]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing) {
        fetchDataSources(filters);
        fetchSyncQueue();
        fetchIntegrationLogs();
      }
    }, 3600000); // 1 hour

    return () => clearInterval(interval);
  }, [refreshing, filters]);

  const handleFilterChange = (name, value) => {
    const newFilters = {
      ...filters,
      [name]: value
    };
    setFilters(newFilters);
    // Auto-apply filters for better UX
    fetchDataSources(newFilters);
  };

  const handleApplyFilters = () => {
    fetchDataSources(filters);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    fetchDataSources(defaultFilters);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchDataSources(filters),
        fetchSyncQueue(),
        fetchIntegrationLogs()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleMappingRules = (dataSourceId) => {
    setSelectedDataSourceId(dataSourceId);
    setShowMapping(true);
  };

  const handleCloseMappingModal = () => {
    setShowMapping(false);
    setSelectedDataSourceId(null);
  };

  // Filter and search data sources
  const filteredDataSources = useMemo(() => {
    let filtered = dataSources;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(ds => 
        ds.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ds.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ds.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ds.module?.module_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply module filter
    if (filters.module_name) {
      filtered = filtered.filter(ds => ds.module?.module_name === filters.module_name);
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(ds => ds.type === filters.type);
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(ds => ds.status === filters.status);
    }

    // Apply sync frequency filters
    if (filters.sync_frequency_min) {
      const minFreq = parseInt(filters.sync_frequency_min);
      filtered = filtered.filter(ds => ds.sync_frequency >= minFreq);
    }
    if (filters.sync_frequency_max) {
      const maxFreq = parseInt(filters.sync_frequency_max);
      filtered = filtered.filter(ds => ds.sync_frequency <= maxFreq);
    }

    // Apply last sync date filters
    if (filters.last_sync_from) {
      const fromDate = new Date(filters.last_sync_from);
      filtered = filtered.filter(ds => {
        if (!ds.last_sync) return false;
        return new Date(ds.last_sync) >= fromDate;
      });
    }
    if (filters.last_sync_to) {
      const toDate = new Date(filters.last_sync_to);
      filtered = filtered.filter(ds => {
        if (!ds.last_sync) return false;
        return new Date(ds.last_sync) <= toDate;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'last_sync') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [dataSources, searchTerm, filters, sortBy, sortOrder]);

  // Get unique modules and types for filters
  const modules = useMemo(() => {
    const uniqueModules = [...new Set(dataSources.map(ds => ds.module?.module_name).filter(Boolean))];
    return uniqueModules;
  }, [dataSources]);

  const types = useMemo(() => {
    const uniqueTypes = [...new Set(dataSources.map(ds => ds.type).filter(Boolean))];
    return uniqueTypes;
  }, [dataSources]);

  // const fetchFilteredDataSources = async () => {
  //   try {
  //     const moduleName = formData?.module?.module_name || "";
  //     const dataSourceType = formData?.type || "";

  //     if (!moduleName && !dataSourceType) {
  //       return fetchDataSources(); // fallback to all if no filter
  //     }

  //     setLoading(true);
  //     const res = await getDataSourcesByModuleAndType(moduleName, dataSourceType);

  //     if (res.success && Array.isArray(res.data)) {
  //       setDataSources(res.data);
  //     } else {
  //       setDataSources([]);
  //     }
  //   } catch (err) {
  //     setError("Failed to fetch filtered data sources.");
  //     setDataSources([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // --- Handlers ---
  const handleSyncDataSource = async (id) => {
    try {
      const result = await syncDataSource(id);

      if (result.success) {
        alert("Data source synced successfully!");
      } else {
        alert("Failed to sync data source.");
      }
      await fetchDataSources();
    } catch (err) {
      console.error(`Error syncing data source ${id}:`, err);
      setError("Failed to sync data source.");
    }
  };

  const handleTestConnection = async (id) => {
    try {
      const result = await testConnection(id);
      alert(result.message || "Connection test completed");
      loadData();
    } catch (err) {
      console.error(`Error testing connection for data source ${id}:`, err);
      alert("Connection test failed. Please check your configuration.");
    }
  };

  const handleDeleteDataSource = async (id) => {
    if (!window.confirm("Are you sure you want to delete this data source?")) return;
    try {
      await deleteDataSource(id);
      setDataSources((prev) => prev.filter((ds) => ds.id !== id));
      alert("Data source deleted successfully.");
    } catch (err) {
      console.error(`Error deleting data source ${id}:`, err);
      setError("Failed to delete data source.");
    }
  };

  const handleBatchSync = async () => {
    if (!dataSourcesNeedingSync.length) {
      alert("No data sources need synchronization.");
      return;
    }
    if (!window.confirm(`Sync ${dataSourcesNeedingSync.length} data source(s)?`)) return;

    try {
      const ids = dataSourcesNeedingSync.map((ds) => ds.id);
      await syncMultipleDataSources(ids);
      alert("Batch sync started successfully!");
      loadData();
    } catch (err) {
      console.error("Error performing batch sync:", err);
      alert("Failed to initiate batch sync.");
    }
  };

  // --- Helpers ---
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getSyncStatusBadge = (source) => {
    if (!Array.isArray(syncQueue)) return null;
    const item = syncQueue.find((i) => i.data_source_id === source.id);
    if (!item) return null;
    const statusMap = {
      pending: ["Queued", "bg-yellow-100 text-yellow-800"],
      in_progress: ["Syncing", "bg-blue-100 text-blue-800"],
      active: ["Synced", "bg-green-100 text-green-800"],
    };
    const [label, className] = statusMap[item.status] || [];
    return (
      label && (
        <span className={`px-2 py-1 text-xs rounded-full ${className}`}>
          {label}
        </span>
      )
    );
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Loading integration data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Data Integration</h1>
              <Badge variant="blue" icon={<MdCloudSync className="w-3 h-3" />}>
                {analytics.successRate || 0}% Success Rate
              </Badge>
            </div>
            <p className="text-gray-600 mb-3">Manage and monitor your data sources and integrations</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MdStorage className="text-blue-500" />
                {analytics.total || 0} Total Sources
              </span>
              <span className="flex items-center gap-1">
                <MdCheckCircle className="text-green-500" />
                {analytics.active || 0} Active
              </span>
              <span className="flex items-center gap-1">
                <MdSyncProblem className="text-orange-500" />
                {analytics.error || 0} Errors
              </span>
              <span className="flex items-center gap-1">
                <MdSchedule className="text-purple-500" />
                Last sync: {analytics.lastSync ? new Date(analytics.lastSync).toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip content="Refresh data">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                disabled={refreshing}
              >
                <MdRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </Tooltip>
            <Button
              onClick={() => navigate("/dashboard/integration/data-sync")}
              variant="outline"
              size="sm"
            >
              <MdSync className="w-4 h-4 mr-1" />
              Data Sync
            </Button>
            <Button
              onClick={() => navigate("/dashboard/integration/import-export")}
              variant="outline"
              size="sm"
            >
              <MdDownload className="w-4 h-4 mr-1" />
              Import/Export
            </Button>
            <Button
              onClick={() => navigate("/dashboard/integration/new-source")}
              variant="primary"
              size="sm"
            >
              <MdAdd className="w-4 h-4 mr-1" />
              Add Data Source
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          title="Error Loading Data"
          message={error}
          action={
            <Button onClick={handleRefresh} variant="primary">
              Retry
            </Button>
          }
        />
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <div>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MdStorage className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sources</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.total || 0}</p>
                <p className="text-xs text-gray-500">All data sources</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <div>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <MdCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Sources</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.active || 0}</p>
                <p className="text-xs text-gray-500">Running smoothly</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <div>
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <MdSyncProblem className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Need Attention</p>
                <p className="text-2xl font-bold text-gray-900">{(analytics.error || 0) + (analytics.pending || 0)}</p>
                <p className="text-xs text-gray-500">Errors + Pending</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <div>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MdQueue className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sync Queue</p>
                <p className="text-2xl font-bold text-gray-900">{Array.isArray(syncQueue) ? syncQueue.length : 0}</p>
                <p className="text-xs text-gray-500">Pending syncs</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      {/* Search and Filter Controls */}
      <Card>
        <div className="space-y-4">
          {/* Filter Presets */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Quick Filters:</span>
            {[
              { key: 'all', label: 'All Sources', icon: <MdStorage className="w-4 h-4" />, filters: defaultFilters },
              { key: 'active', label: 'Active Only', icon: <MdCheckCircle className="w-4 h-4" />, filters: { ...defaultFilters, status: 'active' } },
              { key: 'errors', label: 'Errors Only', icon: <MdError className="w-4 h-4" />, filters: { ...defaultFilters, status: 'error' } },
              { key: 'pending', label: 'Pending Only', icon: <MdWarning className="w-4 h-4" />, filters: { ...defaultFilters, status: 'pending' } },
              { key: 'internal', label: 'Internal Modules', icon: <MdViewModule className="w-4 h-4" />, filters: { ...defaultFilters, type: 'internal_module' } },
              { key: 'database', label: 'Databases', icon: <MdStorage className="w-4 h-4" />, filters: { ...defaultFilters, type: 'database' } },
              { key: 'api', label: 'APIs', icon: <MdCastConnected className="w-4 h-4" />, filters: { ...defaultFilters, type: 'api' } }
            ].map((preset) => {
              const isActive = JSON.stringify(filters) === JSON.stringify(preset.filters);
              return (
                <button
                  key={preset.key}
                  onClick={() => {
                    setFilters(preset.filters);
                    fetchDataSources(preset.filters);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    isActive
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {preset.icon}
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1 max-w-md">
                <SearchInput
                  placeholder="Search data sources..."
                  value={searchTerm}
                  onChange={handleSearch}
                  icon={<MdSearch className="w-4 h-4" />}
                />
              </div>
              <div className="flex gap-2">
                <FilterDropdown
                  label="Module"
                  value={filters.module_name}
                  onChange={(value) => handleFilterChange('module_name', value)}
                  options={[
                    { value: '', label: 'All Modules' },
                    ...modules.map(module => ({ value: module, label: module.charAt(0).toUpperCase() + module.slice(1) }))
                  ]}
                />
                <FilterDropdown
                  label="Type"
                  value={filters.type}
                  onChange={(value) => handleFilterChange('type', value)}
                  options={[
                    { value: '', label: 'All Types' },
                    ...types.map(type => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1) }))
                  ]}
                />
                <FilterDropdown
                  label="Status"
                  value={filters.status}
                  onChange={(value) => handleFilterChange('status', value)}
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'error', label: 'Error' }
                  ]}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">View:</span>
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <MdViewModule className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <MdViewList className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={handleApplyFilters}
                variant="primary"
                size="sm"
                disabled={loading}
              >
                {loading ? "Filtering..." : "Apply"}
              </Button>
              <Button
                onClick={handleResetFilters}
                variant="outline"
                size="sm"
                disabled={!filters.type && !filters.module_name && !filters.status && !filters.sync_frequency_min && !filters.sync_frequency_max && !filters.last_sync_from && !filters.last_sync_to}
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <MdFilterList className="w-4 h-4" />
                Advanced Filters
                <span className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Sync Frequency (hours)
                  </label>
                  <input
                    type="number"
                    value={filters.sync_frequency_min}
                    onChange={(e) => handleFilterChange('sync_frequency_min', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Sync Frequency (hours)
                  </label>
                  <input
                    type="number"
                    value={filters.sync_frequency_max}
                    onChange={(e) => handleFilterChange('sync_frequency_max', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Sync From
                  </label>
                  <input
                    type="date"
                    value={filters.last_sync_from}
                    onChange={(e) => handleFilterChange('last_sync_from', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Sync To
                  </label>
                  <input
                    type="date"
                    value={filters.last_sync_to}
                    onChange={(e) => handleFilterChange('last_sync_to', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {(filters.module_name || filters.type || filters.status || filters.sync_frequency_min || filters.sync_frequency_max || filters.last_sync_from || filters.last_sync_to) && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-blue-700">Active Filters:</span>
              <div className="flex flex-wrap gap-2">
                {filters.module_name && (
                  <Badge variant="blue" className="flex items-center gap-1">
                    Module: {filters.module_name}
                    <button
                      onClick={() => handleFilterChange('module_name', '')}
                      className="ml-1 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filters.type && (
                  <Badge variant="blue" className="flex items-center gap-1">
                    Type: {filters.type}
                    <button
                      onClick={() => handleFilterChange('type', '')}
                      className="ml-1 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filters.status && (
                  <Badge variant="blue" className="flex items-center gap-1">
                    Status: {filters.status}
                    <button
                      onClick={() => handleFilterChange('status', '')}
                      className="ml-1 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filters.sync_frequency_min && (
                  <Badge variant="blue" className="flex items-center gap-1">
                    Min Freq: {filters.sync_frequency_min}h
                    <button
                      onClick={() => handleFilterChange('sync_frequency_min', '')}
                      className="ml-1 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filters.sync_frequency_max && (
                  <Badge variant="blue" className="flex items-center gap-1">
                    Max Freq: {filters.sync_frequency_max}h
                    <button
                      onClick={() => handleFilterChange('sync_frequency_max', '')}
                      className="ml-1 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filters.last_sync_from && (
                  <Badge variant="blue" className="flex items-center gap-1">
                    From: {filters.last_sync_from}
                    <button
                      onClick={() => handleFilterChange('last_sync_from', '')}
                      className="ml-1 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filters.last_sync_to && (
                  <Badge variant="blue" className="flex items-center gap-1">
                    To: {filters.last_sync_to}
                    <button
                      onClick={() => handleFilterChange('last_sync_to', '')}
                      className="ml-1 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
      {/* Data Sources Section */}
      <Card>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Data Sources</h3>
            <Badge variant="gray" icon={<MdList className="w-3 h-3" />}>
              {filteredDataSources.length} sources
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {dataSourcesNeedingSync.length > 0 && (
              <Button
                onClick={handleBatchSync}
                variant="primary"
                size="sm"
                icon={<MdSync className="w-4 h-4" />}
              >
                Sync All ({dataSourcesNeedingSync.length})
              </Button>
            )}
            <Button
              onClick={() => navigate("/dashboard/integration/new-source")}
              variant="primary"
              size="sm"
              icon={<MdAdd className="w-4 h-4" />}
            >
              Add Source
            </Button>
          </div>
        </div>

        {filteredDataSources.length === 0 ? (
          <EmptyState
            icon={<MdStorage className="w-16 h-16 text-gray-400" />}
            title="No data sources found"
            description={
              searchTerm || filters.module_name || filters.type || filters.status
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding your first data source"
            }
            action={
              <Button onClick={() => navigate("/dashboard/integration/new-source")} variant="primary">
                <MdAdd className="w-4 h-4 mr-2" />
                Add Data Source
              </Button>
            }
          />
        ) : viewMode === 'grid' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredDataSources.map((ds) => (
                <Card key={ds.id} className="hover:shadow-lg transition-shadow duration-200">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{ds.name}</h4>
                          <Badge 
                            variant={ds.status === 'active' ? 'green' : ds.status === 'error' ? 'red' : 'gray'}
                            icon={
                              ds.status === 'active' ? <MdCheckCircle className="w-3 h-3" /> :
                              ds.status === 'error' ? <MdError className="w-3 h-3" /> :
                              <MdWarning className="w-3 h-3" />
                            }
                          >
                            {ds.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{ds.description || 'No description'}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MdStorage className="text-blue-500" />
                            {ds.type}
                          </span>
                          {ds.module?.module_name && (
                            <span className="flex items-center gap-1">
                              <MdViewModule className="text-green-500" />
                              {ds.module.module_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {ds.sync_frequency && !isNaN(ds.sync_frequency) ? Math.floor(ds.sync_frequency / 3600) : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Hours between syncs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {ds.last_sync ? new Date(ds.last_sync).toLocaleDateString() : 'Never'}
                        </div>
                        <div className="text-xs text-gray-500">Last synced</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-1">
                        <Tooltip content="Sync now">
                          <Button
                            onClick={() => handleSyncDataSource(ds.id)}
                            variant="outline"
                            size="sm"
                            disabled={ds.status !== "active"}
                          >
                            <MdSync className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Test connection">
                          <Button
                            onClick={() => handleTestConnection(ds.id)}
                            variant="outline"
                            size="sm"
                          >
                            <MdCastConnected className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Edit">
                          <Button
                            onClick={() => navigate(`/dashboard/integration/edit-source/${ds.id}`)}
                            variant="outline"
                            size="sm"
                          >
                            <MdEdit className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Mapping Rules">
                          <Button
                            onClick={() => handleMappingRules(ds.id)}
                            variant="outline"
                            size="sm"
                          >
                            <MdRule className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete">
                          <Button
                            onClick={() => handleDeleteDataSource(ds.id)}
                            variant="outline"
                            size="sm"
                          >
                            <MdDelete className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </div>
                      <Button
                        onClick={() => navigate(`/dashboard/integration/view/${ds.id}`)}
                        variant="primary"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { key: 'name', label: 'Name', sortable: true },
                    { key: 'type', label: 'Type', sortable: true },
                    { key: 'status', label: 'Status', sortable: true },
                    { key: 'last_sync', label: 'Last Synced', sortable: true },
                    { key: 'actions', label: 'Actions', sortable: false }
                  ].map((col) => (
                    <th 
                      key={col.key} 
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                      }`}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && (
                          <div className="flex flex-col">
                            <MdTrendingUp className={`w-3 h-3 ${
                              sortBy === col.key && sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                            <MdTrendingDown className={`w-3 h-3 ${
                              sortBy === col.key && sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDataSources.map((ds) => (
                  <tr key={ds.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ds.name}</div>
                      <div className="text-sm text-gray-500">{ds.description}</div>
                      {getSyncStatusBadge(ds)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="blue" icon={<MdStorage className="w-3 h-3" />}>
                        {ds.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={ds.status === 'active' ? 'green' : ds.status === 'error' ? 'red' : 'gray'}
                        icon={
                          ds.status === 'active' ? <MdCheckCircle className="w-3 h-3" /> :
                          ds.status === 'error' ? <MdError className="w-3 h-3" /> :
                          <MdWarning className="w-3 h-3" />
                        }
                      >
                        {ds.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ds.last_sync ? new Date(ds.last_sync).toLocaleString() : "Never"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Tooltip content="Sync now">
                          <Button
                            onClick={() => handleSyncDataSource(ds.id)}
                            variant="outline"
                            size="sm"
                            disabled={ds.status !== "active"}
                          >
                            <MdSync className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Test connection">
                          <Button
                            onClick={() => handleTestConnection(ds.id)}
                            variant="outline"
                            size="sm"
                          >
                            <MdCastConnected className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Edit">
                          <Button
                            onClick={() => navigate(`/dashboard/integration/edit-source/${ds.id}`)}
                            variant="outline"
                            size="sm"
                          >
                            <MdEdit className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Mapping Rules">
                          <Button
                            onClick={() => handleMappingRules(ds.id)}
                            variant="outline"
                            size="sm"
                          >
                            <MdRule className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete">
                          <Button
                            onClick={() => handleDeleteDataSource(ds.id)}
                            variant="outline"
                            size="sm"
                          >
                            <MdDelete className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Button
                          onClick={() => navigate(`/dashboard/integration/view/${ds.id}`)}
                          variant="primary"
                          size="sm"
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Mapping Rules Modal */}
      <Modal
        isOpen={showMapping}
        onClose={handleCloseMappingModal}
        title="Field Mapping Rules"
        size="large"
      >
        {selectedDataSourceId && (
          <MappingRuleList dataSourceId={selectedDataSourceId} />
        )}
      </Modal>
    </div>
  );
};

export default IntegrationPage;
