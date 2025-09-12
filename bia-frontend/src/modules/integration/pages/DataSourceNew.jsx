import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { createDataSource } from "../../../api/integrationApi"; 

const DataSourceNew = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedDataSource, setSavedDataSource] = useState(null);
  const [createdDataSource, setCreatedDataSource] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const [touchedFields, setTouchedFields] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    connection_config: {},
    module: {
      module_name: "",
      fact_tables: ""
    },
    status: "inactive",
    query: "",
    sync_frequency: 3600,
    created_by: 1, // TODO: replace with logged-in user id
  });
  // Handle normal input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
        [name]: name === "sync_frequency" ? Number(value) : value,
      }));
  };

  const handleConnectionConfigChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      connection_config: {
        ...formData.connection_config,
        [name]: value
      }
    });
    
    // Mark field as touched
    setTouchedFields({
      ...touchedFields,
      [name]: true
    });
    
    // Validate connection field
    const fieldErrors = validateField(name, value, 'connection');
    setValidationErrors({
      ...validationErrors,
      ...fieldErrors
    });
    
    setIsFormDirty(true);
  };
  // handle connection config changes
  const handleConfigChange = (e) => {
    try {
      const parsed = JSON.parse(e.target.value);
      setFormData((prev) => ({
        ...prev,
        connection_config: parsed
      }));
      setError(null);
    } catch (err) {
      setError('Invalid JSON for connection config');
    }
  };

  const handleTestConnection = async () => {
    if (!formData.type || !formData.connection_config) {
      setError('Please fill in the data source type and connection details first.');
      return;
    }

    setLoading(true);
    setConnectionTestResult(null);
    setError(null);

    try {
      // Create a temporary data source for testing
      const testData = {
        ...formData,
        name: `test_${Date.now()}`,
        status: 'inactive'
      };

      const response = await integrationApi.createDataSource(testData);
      const testResult = await integrationApi.testConnection(response.data.id);
      
      setConnectionTestResult({
        success: true,
        message: 'Connection test successful!',
        data: testResult.data
      });

      // Clean up test data source
      await integrationApi.deleteDataSource(response.data.id);
    } catch (err) {
      setConnectionTestResult({
        success: false,
        message: err.response?.data?.message || 'Connection test failed. Please check your configuration.',
        data: null
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle module_name,fact_tables selection
  const handleModuleNameChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      module: { ...prev.module, module_name: e.target.value }
    }));
  };

  const handleFactTablesChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      module: { ...prev.module, fact_tables: e.target.value }
    }));
  };
  // Handle form submit and declare the adding mapping rules automatically after saving
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await createDataSource(formData);
      setSavedDataSource(response);
      alert("Data source created successfully!");
      setCreatedDataSource(true);
    } catch (err) {
      console.error("Error creating data source:", err);
      setError(err.response?.data?.message || "Failed to create data source");
    } finally {
      setLoading(false);
    }
  };

  const dataSourceTypes = [
    { value: 'internal_module', label: 'Internal Module' },
    { value: 'api', label: 'API' },
    { value: 'database', label: 'Database' },
    { value: 'file', label: 'File' },
    { value: 'webhook', label: 'Webhook' },
  ];

  // Render data types details based on choosing the module name
  const renderModuleDataTypeDetails = () => {
    switch (formData.module.module_name) {
      case "sales":
      return (
        <div className="mb-4">
          <label className="block font-medium">Store Tables</label>
          <select
            id="fact_tables"
            value={formData.module.fact_tables}
            className="w-full border p-2 rounded font-mono"
            onChange={(e) => handleFactTablesChange(e, "fact_tables")}
          >
            <option value="fact_sales">fact_sales</option>
            <option value="fact_transactions">fact_transactions</option>
            <option value="fact_performance">fact_performance</option>
          </select>
        </div>
      );
      case "hr":
      return (
        <div className="mb-4">
          <label className="block font-medium">Store Tables</label>
          <select
            id="fact_tables"
            value={formData.module.fact_tables}
            className="w-full border p-2 rounded font-mono"
            onChange={(e) => handleFactTablesChange(e, "fact_tables")}
          >
            <option value="fact_employees">fact_employees</option>
            <option value="fact_attendance">fact_attendance</option>
            <option value="fact_performance">fact_performance</option>
          </select>
        </div>
      );
      case "finance":
      return (
        <div className="mb-4">
          <label className="block font-medium">Store Tables</label>
          <select
            id="fact_tables"
            value={formData.module.fact_tables}
            className="w-full border p-2 rounded font-mono"
            onChange={(e) => handleFactTablesChange(e, "fact_tables")}
          >
            <option value="fact_financials">fact_financials</option>
            <option value="fact_budget">fact_budget</option>
          </select>
        </div>
      );
      case "supply_chain":
      return (
        <div className="mb-4">
          <label className="block font-medium">Store Tables</label>
          <select
            id="fact_tables"
            value={formData.module.fact_tables}
            className="w-full border p-2 rounded font-mono"
            onChange={(e) => handleFactTablesChange(e, "fact_tables")}
          >
            <option value="dim_products">dim_products</option>
            <option value="dim_suppliers">dim_suppliers</option>
            <option value="dim_warehouses">dim_warehouses</option>
            <option value="dim_distributors">dim_distributors</option>
            <option value="dim_users">dim_users</option>
            <option value="dim_date">dim_date</option>
            <option value="dim_logistics_providers">dim_logistics_providers</option>
            <option value="dim_drivers">dim_drivers</option>
            <option value="dim_contracts">dim_contracts</option>

            <option value="fact_procurement">fact_procurement</option>
            <option value="fact_goods_receipt">fact_goods_receipt</option>
            <option value="fact_invoices">fact_invoices</option>
            <option value="fact_inventory">fact_inventory</option>
            <option value="stock_transfer">stock_transfer</option>
            <option value="fact_distribution">fact_distribution</option>
            <option value="fact_delivery_routes">fact_delivery_routes</option>
            <option value="fact_supplier_performance">fact_supplier_performance</option>
            <option value="fact_distribution_kpis">fact_distribution_kpis</option>
          </select>
        </div>
      );
      default:
        return (<div>Select a module to see details</div>);
    }
  };

  // Render connection details form based on data source type
  const renderConnectionDetailsForm = () => {
    switch (formData.type) {
      case 'api':
        return (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="base_url">
                API Base URL *
              </label>
              <input
                type="text"
                id="base_url"
                name="base_url"
                value={formData.connection_config.base_url || ''}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="https://api.example.com/v1"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="method">
                HTTP Method
              </label>
              <select
                id="method"
                name="method"
                value={formData.connection_config.method || 'GET'}
                onChange={handleConnectionConfigChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="timeout">
                Timeout (ms)
              </label>
              <input
                type="number"
                id="timeout"
                name="timeout"
                value={formData.connection_config.timeout || 5000}
                onChange={handleConnectionConfigChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="5000"
                min="1000"
                max="60000"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="headers">
                Headers (JSON)
              </label>
              <textarea
                id="headers"
                name="headers"
                value={formData.connection_config.headers ? JSON.stringify(formData.connection_config.headers, null, 2) : ''}
                onChange={(e) => {
                  try {
                    const headers = e.target.value ? JSON.parse(e.target.value) : {};
                    handleConnectionConfigChange({ target: { name: 'headers', value: headers } });
                  } catch (err) {
                    // Invalid JSON, don't update
                  }
                }}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
                placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
              />
              <p className="text-sm text-gray-500 mt-1">Define headers as a JSON object</p>
            </div>
          </>
        );
        
      case 'database':
        return (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="host">
                Host *
              </label>
              <input
                type="text"
                id="host"
                name="host"
                value={formData.connection_config.host || ''}
                onChange={handleConnectionConfigChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="localhost or db.example.com"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="port">
                Port
              </label>
              <input
                type="number"
                id="port"
                name="port"
                value={formData.connection_config.port || ''}
                onChange={handleConnectionConfigChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="3306"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="database">
                Database Name *
              </label>
              <input
                type="text"
                id="database"
                name="database"
                value={formData.connection_config.database || ''}
                onChange={handleConnectionConfigChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="my_database"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Username *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.connection_config.username || ''}
                onChange={handleConnectionConfigChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="db_user"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.connection_config.password || ''}
                onChange={handleConnectionConfigChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Password"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="query">
                Query *
              </label>
              <textarea
                id="query"
                name="query"
                value={formData.connection_config.query || ''}
                onChange={handleConnectionConfigChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
                placeholder="SELECT * FROM table_name WHERE condition"
                required
              />
              <p className="text-sm text-gray-500 mt-1">SQL query to extract data</p>
            </div>
          </>
        );
        
      case 'file':
        return (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file_path">
                File Path or URL *
              </label>
              <input
                type="text"
                id="file_path"
                name="file_path"
                value={formData.connection_config.file_path || ''}
                onChange={handleConnectionConfigChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="/path/to/file.csv or https://example.com/data.csv"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="format">
                File Format
              </label>
              <select
                id="format"
                name="format"
                value={formData.connection_config.format || 'csv'}
                onChange={handleConnectionConfigChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="xml">XML</option>
                <option value="excel">Excel</option>
              </select>
            </div>
          </>
        );
        
      case 'webhook':
        return (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="url">
                Webhook URL *
              </label>
              <input
                type="text"
                id="url"
                name="url"
                value={formData.connection_config.url || ''}
                onChange={handleConnectionConfigChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="https://webhook.example.com/endpoint"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="method">
                HTTP Method
              </label>
              <select
                id="method"
                name="method"
                value={formData.connection_config.method || 'POST'}
                onChange={handleConnectionConfigChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
                <option value="PUT">PUT</option>
              </select>
            </div>
          </>
        );
        
      case 'internal_module':
        return (
          <>
          {/* Connection Config */}
          <div className="mb-4">
            <label className="block font-medium">Connection Config (JSON)</label>
            <textarea
              rows="4"
              className="w-full border p-2 rounded font-mono"
              onChange={handleConfigChange}
              placeholder='{"schema": "public", "table": "employees"}'
            />
          </div>
            {/* Module Name */}
         <div className="grid grid-cols-2 gap-3">
          <div className="mb-4">
            <label className="block font-medium">Module</label>
            <select
              className="w-full border p-2 rounded"
              value={formData.module.module_name}
              onChange={handleModuleNameChange}
            >
              <option value="hr">HR</option>
              <option value="crm">CRM</option>
              <option value="finance">Finance</option>
              <option value="sales">Sales</option>
              <option value="procurement">Procurement</option>
              <option value="supply_chain">Supply Chain</option>
              <option value="project_management">Project Management</option>
              <option value="inventory">Inventory</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="partner_portal">Partner Portal</option>
            </select>
          </div>

          {/* Render fact/dim tables based on module */}
          {renderModuleDataTypeDetails()}
        </div>
          {/* Query */}
          <div className="mb-4">
            <label className="block font-medium">Query</label>
            <textarea
              name="query"
              rows="3"
              className="w-full border p-2 rounded"
              value={formData.query}
              onChange={handleChange}
            />
          </div>
          </>
        );
        
      default:
        return (
          <div className="mb-4 p-4 bg-gray-100 rounded">
            <p>Please select a data source type to see connection details form.</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      
        <h2 className="text-2xl font-bold mb-6 text-blue-800">Create Data Source</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Data Source Name */}
          <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium">Data Source Name</label>
            <input
              type="text"
              name="name"
              className="w-full border p-2 rounded"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          {/* Type */}
          <div>
            <label className="block font-medium">Type</label>
            <select
              name="type"
              className="w-full border p-2 rounded"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select type</option>
              {dataSourceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block font-medium">Status</label>
            <select
              name="status"
              className="w-full border p-2 rounded"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="inactive">Inactive</option>
              <option value="active">Active</option>
            </select>
          </div>

          {/* Sync Frequency */}
          <div>
            <label className="block font-medium">Sync Frequency (seconds)</label>
            <input
              type="number"
              name="sync_frequency"
              className="w-full border p-2 rounded"
              value={formData.sync_frequency}
              onChange={handleChange}
              min="60"
            />
          </div>
         </div>
          {/* Connection Config */}
          <div>
            <div className="mb-4">
              <label className="block font-medium mb-2">Connection Details</label>
              {/* {formData.type && (
                <Button type="button" onClick={handleTestConnection} className="text-blue-500 hover:underline">
                  Test
                </Button>
              )} */}
            </div>
            {renderConnectionDetailsForm()}
          </div>

          {/* Submit */}
          <Button
            variant="primary"
            size="md"
            type="submit"
            disabled={loading || !!error}
          >
            {loading ? "Creating..." : "Create Data Source"}
          </Button>
        </form>
        {/* Finish Button */}
          <div className="mt-6">
            <Button
              variant="success"
              size="md"
              onClick={() => setSuccessModal(true)}
              className="w-full"
            >
              Finish Setup
            </Button>
          </div>
      </Card>

      
    {/* Success Modal */}
    <Modal isOpen={successModal} onClose={() => navigate("/data-sources")}>
      <h3 className="text-lg font-bold">Setup Complete</h3>
      <p>Your data source and mapping rules have been successfully created.</p>
      <Button
        variant="primary"
        size="md"
        onClick={() => navigate("/integration")}
      >
        Go to Data Sources
      </Button>
    </Modal>
    </div>
  );
};

export default DataSourceNew;
