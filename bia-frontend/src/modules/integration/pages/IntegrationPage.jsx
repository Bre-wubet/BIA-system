import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAllDataSources,
  getDataSourcesNeedingSync,
  syncDataSource,
  testConnection,
  deleteDataSource,
  syncMultipleDataSources,
  getDataSourcesByModuleAndType
} from "../../../api/integrationApi";
import MappingRuleList from '../components/MappingRuleList';
import Button from "../../../components/ui/Button";
import { MdDelete, MdEdit, MdSync, MdCastConnected, MdQueue, MdList} from "react-icons/md";

  const IntegrationPage = () => {
    const defaultFilters = {
    module_name: "",
    type: ""
  };

  const [filters, setFilters] = useState(defaultFilters);
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncQueue, setSyncQueue] = useState([]);
  const [activeDataSources, setActiveDataSources] = useState([]);
  const [dataSourcesNeedingSync, setDataSourcesNeedingSync] = useState([]);
  const [showMapping, setShowMapping] = useState(false);
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

  useEffect(() => {
    fetchDataSources();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    fetchDataSources(filters);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    fetchDataSources(defaultFilters);
  };

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

  if (loading) return <div className="p-4">Loading integration data...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl text-blue-800 font-bold">Data Integration</h1>
        <div className="space-x-2">
          <Button
            onClick={() => navigate("/integration/data-sync")}
            variant="primary"
          >
            Data Sync
          </Button>
          <Button
            onClick={() => navigate("/integration/import-export")}
            variant="secondary"
          >
            Import/Export
          </Button>
          <Button
            onClick={() => navigate("/integration/new-source")}
            variant="primary"
          >
            Add Data Source
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MdList className="w-4 h-4 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sources</p>
              <p className="text-2xl font-semibold text-gray-900">{dataSources.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MdCastConnected className="w-4 h-4 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Sources</p>
              <p className="text-2xl font-semibold text-gray-900">{dataSources.filter(ds => ds.status === 'active').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <MdSync className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Need Sync</p>
              <p className="text-2xl font-semibold text-gray-900">{dataSources.filter(ds => ds.status === 'inactive').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MdQueue className="w-4 h-4 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sync Queue</p>
              <p className="text-2xl font-semibold text-gray-900">{syncQueue.length}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Module Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
          <select
            name="module_name"
            value={filters.module_name}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Modules</option>
            <option value="sales">Sales</option>
            <option value="finance">Finance</option>
            <option value="hr">HR</option>
            <option value="supply chain">Supply Chain</option>
            <option value="production">Production</option>
            <option value="procurement">Procurement</option>
            <option value="crm">CRM</option>
          </select>
        </div>

        {/* Type Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="w-full border border-gray-300 rounded-md shadow-sm px-2 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="internal_module">Internal Module</option>
            <option value="postgres">Postgres</option>
            <option value="mongodb">MongoDB</option>
            <option value="api">API</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-start md:justify-end">
          <Button
            onClick={handleApplyFilters}
            variant="primary"
            disabled={loading}
          >
            {loading ? "Filtering..." : "Apply Filter"}
          </Button>
          <Button
            onClick={handleResetFilters}
            variant="secondary"
            disabled={!filters.type && !filters.module_name}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {/* Data Sources Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-medium">Data Sources</h3>
          {dataSourcesNeedingSync.length > 0 && (
            <button
              onClick={handleBatchSync}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
            >
              Sync All ({dataSourcesNeedingSync.length})
            </button>
          )}
        </div>
        {dataSources.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-4">No data sources found.</p>
            <Link to="/integration/new-source" className="text-blue-600 hover:underline">
              Add one
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Name", "Type", "Status", "Last Synced", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dataSources.map((ds) => (
                  <tr key={ds.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ds.name}</div>
                      <div className="text-sm text-gray-500">{ds.description}</div>
                      {getSyncStatusBadge(ds)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {ds.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(ds.status)}`}>
                        {ds.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ds.last_sync ? new Date(ds.last_sync).toLocaleString() : "Never"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg font-medium space-x-4">
                      <button
                        onClick={() => handleSyncDataSource(ds.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                        disabled={ds.status !== "active"}
                        title={ds.status !== "active" ? "Must be active to sync" : "Sync now"}
                      >
                        <MdSync />
                      </button>
                      <button
                        onClick={() => handleTestConnection(ds.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <MdCastConnected />
                      </button>
                      <button
                        onClick={() => navigate(`/integration/edit-source/${ds.id}`)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <MdEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteDataSource(ds.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <MdDelete />
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-900 text-sm"
                        onClick={() => setShowMapping((prev) => !prev)}
                      >
                        {showMapping ? "Hide Rules" : "Map Rule"}
                      </button>

                      {showMapping && (
                        <div className="mt-4">
                          <MappingRuleList dataSourceId={ds.id} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationPage;
