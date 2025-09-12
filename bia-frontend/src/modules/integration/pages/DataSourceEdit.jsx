// src/pages/DataSources/DataSourceEdit.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDataSource, updateDataSource, getDataSourceTypes } from "../../../api/integrationApi";
import { toast } from "react-toastify";
import JSONEditor from "../../../components/ui/JSONEditor";

const DataSourceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    status: "active",
    query: "",
    sync_frequency: "",
    connection_config: {},
    module: {},
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dataSourceTypes, setDataSourceTypes] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  // Fetch datasource details and types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ds, types] = await Promise.all([
          getDataSource(id),
          getDataSourceTypes()
        ]);
        
        setFormData({
          ...ds,
          connection_config: ds.connection_config || {},
          module: ds.module || {},
        });
        setDataSourceTypes(types.data || []);
      } catch (err) {
        toast.error("Failed to load DataSource details.");
        setError("Failed to load DataSource details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
    
    // Clear validation error when field is updated
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleJsonChange = (name, value) => {
    try {
      const parsed = value ? JSON.parse(value) : {};
      setFormData((prev) => ({ ...prev, [name]: parsed }));
      setIsDirty(true);
      
      // Clear validation error when field is updated
      if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: null }));
      }
    } catch (err) {
      setFormErrors(prev => ({ ...prev, [name]: `Invalid JSON in ${name}` }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.type) errors.type = "Type is required";
    if (!formData.sync_frequency) errors.sync_frequency = "Sync frequency is required";
    
    // Validate JSON fields
    try {
      if (typeof formData.connection_config === 'string') {
        JSON.parse(formData.connection_config);
      }
    } catch (err) {
      errors.connection_config = "Invalid JSON in connection configuration";
    }
    
    try {
      if (typeof formData.module === 'string') {
        JSON.parse(formData.module);
      }
    } catch (err) {
      errors.module = "Invalid JSON in module configuration";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateDataSource(id, formData);
      setSuccess("DataSource updated successfully.");
      toast.success("DataSource updated successfully.");
      setIsDirty(false);
      setTimeout(() => navigate("/integration"), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to update DataSource.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // Prompt user when trying to leave with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
  
  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      <p className="ml-2">Loading DataSource...</p>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-green-900">Edit DataSource</h2>
        <button
          type="button"
          onClick={() => navigate(`/integration/data-source/${id}`)}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Back to Details
        </button>
      </div>

      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p>{error}</p>
      </div>}
      
      {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
        <p>{success}</p>
      </div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              className={`w-full border rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter data source name"
            />
            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              name="type"
              value={formData.type || ""}
              onChange={handleChange}
              className={`w-full border rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500 ${formErrors.type ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select a type</option>
              {dataSourceTypes.map((type) => (
                <option key={type.id || type.value || type} value={type.value || type}>
                  {type.label || type.value || type}
                </option>
              ))}
            </select>
            {formErrors.type && <p className="text-red-500 text-xs mt-1">{formErrors.type}</p>}
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="error">Error</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sync Frequency (hours) *</label>
            <input
              type="number"
              name="sync_frequency"
              value={formData.sync_frequency || ""}
              onChange={handleChange}
              placeholder="e.g., 24 for daily, 1 for hourly"
              min="1"
              className={`w-full border rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500 ${formErrors.sync_frequency ? 'border-red-500' : 'border-gray-300'}`}
            />
            {formErrors.sync_frequency && <p className="text-red-500 text-xs mt-1">{formErrors.sync_frequency}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Query</label>
          <textarea
            name="query"
            value={formData.query || ""}
            onChange={handleChange}
            rows={4}
            placeholder="Enter SQL query or data extraction logic"
            className="w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-green-500 focus:border-green-500 font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Connection Config (JSON)</label>
          <div className="border border-gray-300 rounded-md overflow-hidden">
            <JSONEditor
              value={JSON.stringify(formData.connection_config, null, 2)}
              onChange={(value) => handleJsonChange('connection_config', value)}
              height="200px"
            />
          </div>
          {formErrors.connection_config && <p className="text-red-500 text-xs mt-1">{formErrors.connection_config}</p>}
          <p className="text-xs text-gray-500 mt-1">Enter connection details like host, port, username, etc.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Module Config (JSON)</label>
          <div className="border border-gray-300 rounded-md overflow-hidden">
            <JSONEditor
              value={JSON.stringify(formData.module, null, 2)}
              onChange={(value) => handleJsonChange('module', value)}
              height="200px"
            />
          </div>
          {formErrors.module && <p className="text-red-500 text-xs mt-1">{formErrors.module}</p>}
          <p className="text-xs text-gray-500 mt-1">Enter module configuration details</p>
        </div>

        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(`/integration/data-source/${id}`)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="inline-block animate-spin mr-2">⟳</span>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DataSourceEdit;
