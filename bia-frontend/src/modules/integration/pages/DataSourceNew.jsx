import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import Alert from "../../../components/ui/Alert";
import Badge from "../../../components/ui/Badge";
import Tooltip from "../../../components/ui/Tooltip";
import { createDataSource, testConnection } from "../../../api/integrationApi";
import {
  MdArrowBack,
  MdArrowForward,
  MdCheck,
  MdError,
  MdWarning,
  MdInfo,
  MdStorage,
  MdApi,
  MdStorage as MdDatabase,
  MdFileUpload,
  MdWebhook,
  MdSettings,
  MdPlayArrow as MdTest,
  MdSave,
  MdRefresh,
  MdVisibility,
  MdVisibilityOff,
  MdHelp,
  MdCode,
  MdDataUsage,
  MdSchedule,
  MdSecurity,
  MdCloudSync
} from "react-icons/md"; 

const DataSourceNew = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);
  const [savedDataSource, setSavedDataSource] = useState(null);
  const [createdDataSource, setCreatedDataSource] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [testResult, setTestResult] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isFormDirty, setIsFormDirty] = useState(false);

  const totalSteps = 4;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
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

  // Validation functions
  const validateField = (name, value, section = 'basic') => {
    const errors = {};
    
    if (section === 'basic') {
      if (name === 'name' && !value.trim()) {
        errors.name = 'Data source name is required';
      } else if (name === 'type' && !value) {
        errors.type = 'Data source type is required';
      }
    } else if (section === 'connection') {
      if (name === 'host' && !value) {
        errors.host = 'Host is required';
      } else if (name === 'database' && !value) {
        errors.database = 'Database name is required';
      } else if (name === 'username' && !value) {
        errors.username = 'Username is required';
      } else if (name === 'base_url' && !value) {
        errors.base_url = 'API base URL is required';
      } else if (name === 'file_path' && !value) {
        errors.file_path = 'File path is required';
      } else if (name === 'url' && !value) {
        errors.url = 'Webhook URL is required';
      }
    }
    
    return errors;
  };

  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 1: // Basic Info
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.type) errors.type = 'Type is required';
        break;
      case 2: // Connection
        if (formData.type === 'database') {
          if (!formData.connection_config.host) errors.host = 'Host is required';
          if (!formData.connection_config.database) errors.database = 'Database is required';
          if (!formData.connection_config.username) errors.username = 'Username is required';
        } else if (formData.type === 'api') {
          if (!formData.connection_config.base_url) errors.base_url = 'Base URL is required';
        } else if (formData.type === 'file') {
          if (!formData.connection_config.file_path) errors.file_path = 'File path is required';
        } else if (formData.type === 'webhook') {
          if (!formData.connection_config.url) errors.url = 'Webhook URL is required';
        }
        break;
      case 3: // Module & Query
        if (formData.type === 'internal_module') {
          if (!formData.module.module_name) errors.module_name = 'Module is required';
          if (!formData.module.fact_tables) errors.fact_tables = 'Table is required';
        }
        if (!formData.query.trim()) errors.query = 'Query is required';
        break;
      case 4: // Settings
        if (formData.sync_frequency < 60) errors.sync_frequency = 'Sync frequency must be at least 60 seconds';
        break;
    }
    
    return errors;
  };

  const canProceedToNext = () => {
    const errors = validateStep(currentStep);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (canProceedToNext() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };
  // Handle normal input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "sync_frequency" ? Number(value) : value,
    }));
    
    // Mark field as touched
    setTouchedFields({
      ...touchedFields,
      [name]: true
    });
    
    // Validate field
    const fieldErrors = validateField(name, value, 'basic');
    setValidationErrors({
      ...validationErrors,
      ...fieldErrors
    });
    
    setIsFormDirty(true);
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

    setTesting(true);
    setTestResult(null);
    setError(null);

    try {
      // Create a temporary data source for testing
      const testData = {
        ...formData,
        name: `test_${Date.now()}`,
        status: 'inactive'
      };

      const response = await createDataSource(testData);
      const testResult = await testConnection(response.data.id);
      
      setTestResult({
        success: true,
        message: 'Connection test successful!',
        data: testResult.data
      });

      // Clean up test data source
      await integrationApi.deleteDataSource(response.data.id);
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

  const getStepIcon = (step) => {
    switch (step) {
      case 1: return <MdStorage className="w-5 h-5" />;
      case 2: return <MdSettings className="w-5 h-5" />;
      case 3: return <MdCode className="w-5 h-5" />;
      case 4: return <MdSchedule className="w-5 h-5" />;
      default: return <MdCheck className="w-5 h-5" />;
    }
  };

  const getStepTitle = (step) => {
    switch (step) {
      case 1: return 'Basic Information';
      case 2: return 'Connection Details';
      case 3: return 'Module & Query';
      case 4: return 'Settings & Test';
      default: return 'Complete';
    }
  };

  const getDataSourceTypeIcon = (type) => {
    switch (type) {
      case 'database': return <MdDatabase className="w-5 h-5" />;
      case 'api': return <MdApi className="w-5 h-5" />;
      case 'file': return <MdFileUpload className="w-5 h-5" />;
      case 'webhook': return <MdWebhook className="w-5 h-5" />;
      case 'internal_module': return <MdStorage className="w-5 h-5" />;
      default: return <MdStorage className="w-5 h-5" />;
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Creating data source..." />;
  }

  return (
    <div className="">
      <div className="max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button
              onClick={() => navigate('/integration')}
              variant="outline"
              size="sm"
              icon={<MdArrowBack className="w-4 h-4" />}
            >
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Create Data Source</h1>
          </div>
          <p className="text-gray-600">Set up a new data source to integrate with your system</p>
        </div>

        {/* Progress Steps */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <div key={step} className="flex items-center">
                  <div className="flex items-center">
                    <button
                      onClick={() => goToStep(step)}
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                        step === currentStep
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : step < currentStep
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 bg-white text-gray-500'
                      }`}
                    >
                      {step < currentStep ? (
                        <MdCheck className="w-5 h-5" />
                      ) : (
                        getStepIcon(step)
                      )}
                    </button>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        step === currentStep ? 'text-blue-600' : 
                        step < currentStep ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {getStepTitle(step)}
                      </p>
                    </div>
                  </div>
                  {step < totalSteps && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      step < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert
            type="error"
            title="Error"
            message={error}
            className="mb-6"
          />
        )}

        {/* Test Result */}
        {testResult && (
          <Alert
            type={testResult.success ? 'success' : 'error'}
            title={testResult.success ? 'Connection Test Successful' : 'Connection Test Failed'}
            message={testResult.message}
            className="mb-6"
          />
        )}

        {/* Form Content */}
        <Card>
          <div className="p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <MdStorage className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
                  <p className="text-gray-600">Provide basic details about your data source</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Source Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter data source name"
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter description (optional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Source Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {dataSourceTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                        className={`p-4 border-2 rounded-lg text-left transition-colors ${
                          formData.type === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {getDataSourceTypeIcon(type.value)}
                          <span className="font-medium">{type.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {validationErrors.type && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.type}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Connection Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <MdSettings className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Details</h2>
                  <p className="text-gray-600">Configure the connection settings for your data source</p>
                </div>

                {renderConnectionDetailsForm()}

                {formData.type && (
                  <div className="flex justify-center">
                    <Button
                      onClick={handleTestConnection}
                      variant="outline"
                      size="lg"
                      disabled={testing}
                      icon={testing ? <MdRefresh className="w-4 h-4 animate-spin" /> : <MdTest className="w-4 h-4" />}
                    >
                      {testing ? 'Testing Connection...' : 'Test Connection'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Module & Query */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                    <MdCode className="w-8 h-8 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Module & Query</h2>
                  <p className="text-gray-600">Configure module settings and data query</p>
                </div>

                {formData.type === 'internal_module' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Module *
                      </label>
                      <select
                        value={formData.module.module_name}
                        onChange={handleModuleNameChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select module</option>
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Table *
                      </label>
                      {renderModuleDataTypeDetails()}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Query *
                  </label>
                  <textarea
                    name="query"
                    value={formData.query}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Enter your SQL query or data extraction query"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Enter the query to extract data from your source
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Settings & Test */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                    <MdSchedule className="w-8 h-8 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings & Test</h2>
                  <p className="text-gray-600">Configure sync settings and test your data source</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sync Frequency (seconds) *
                    </label>
                    <input
                      type="number"
                      name="sync_frequency"
                      value={formData.sync_frequency}
                      onChange={handleChange}
                      min="60"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Minimum: 60 seconds (1 minute)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Initial Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="inactive">Inactive</option>
                      <option value="active">Active</option>
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                      You can activate it later after testing
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>
                      <span className="ml-2 text-gray-900">{formData.name || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>
                      <span className="ml-2 text-gray-900">{formData.type || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Sync Frequency:</span>
                      <span className="ml-2 text-gray-900">{formData.sync_frequency} seconds</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className="ml-2 text-gray-900 capitalize">{formData.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-200">
              <Button
                onClick={prevStep}
                variant="outline"
                disabled={currentStep === 1}
                icon={<MdArrowBack className="w-4 h-4" />}
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {currentStep < totalSteps ? (
                  <Button
                    onClick={nextStep}
                    variant="primary"
                    disabled={!canProceedToNext()}
                    icon={<MdArrowForward className="w-4 h-4" />}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    variant="primary"
                    disabled={loading || !canProceedToNext()}
                    icon={loading ? <MdRefresh className="w-4 h-4 animate-spin" /> : <MdSave className="w-4 h-4" />}
                  >
                    {loading ? 'Creating...' : 'Create Data Source'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Success Modal */}
        <Modal isOpen={successModal} onClose={() => navigate("/integration")}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <MdCheck className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Setup Complete!</h3>
            <p className="text-gray-600 mb-6">
              Your data source has been successfully created and is ready to use.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => navigate("/integration")}
                variant="primary"
              >
                View Data Sources
              </Button>
              <Button
                onClick={() => navigate("/integration/new-source")}
                variant="outline"
              >
                Create Another
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default DataSourceNew;
