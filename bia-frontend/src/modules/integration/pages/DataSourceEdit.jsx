// src/pages/DataSources/DataSourceEdit.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDataSource, updateDataSource, getDataSourceTypes, testConnection } from "../../../api/integrationApi";
import { toast } from "react-toastify";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import Alert from "../../../components/ui/Alert";
import Badge from "../../../components/ui/Badge";
import Tooltip from "../../../components/ui/Tooltip";
import JSONEditor from "../../../components/ui/JSONEditor";
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
  MdCloudSync,
  MdEdit,
  MdCancel
} from "react-icons/md";

const DataSourceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    status: "active",
    query: "",
    sync_frequency: 3600,
    connection_config: {},
    module: {
      module_name: "",
      fact_tables: ""
    },
  });

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [dataSourceTypes, setDataSourceTypes] = useState([
    { value: 'internal_module', label: 'Internal Module' },
    { value: 'api', label: 'API' },
    { value: 'database', label: 'Database' },
    { value: 'file', label: 'File' },
    { value: 'webhook', label: 'Webhook' },
  ]);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [testResult, setTestResult] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [originalData, setOriginalData] = useState(null);

  const totalSteps = 3;

  // Fetch datasource details and types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ds, types] = await Promise.all([
          getDataSource(id),
          getDataSourceTypes()
        ]);
        
        const data = {
          ...ds,
          connection_config: ds.connection_config || {},
          module: ds.module || { module_name: "", fact_tables: "" },
        };
        
        setFormData(data);
        setOriginalData(data);
      } catch (err) {
        toast.error("Failed to load DataSource details.");
        setError("Failed to load DataSource details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Validation functions
  const validateField = (name, value, section = 'basic') => {
    const errors = {};
    
    if (section === 'basic') {
      if (name === 'name' && (!value || !value.trim())) {
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
    
    if (!formData) return errors;
    
    switch (step) {
      case 1: // Basic Info
        if (!formData.name || !formData.name.trim()) errors.name = 'Name is required';
        if (!formData.type) errors.type = 'Type is required';
        break;
      case 2: // Connection
        if (formData.type === 'database') {
          if (!formData.connection_config?.host) errors.host = 'Host is required';
          if (!formData.connection_config?.database) errors.database = 'Database is required';
          if (!formData.connection_config?.username) errors.username = 'Username is required';
        } else if (formData.type === 'api') {
          if (!formData.connection_config?.base_url) errors.base_url = 'Base URL is required';
        } else if (formData.type === 'file') {
          if (!formData.connection_config?.file_path) errors.file_path = 'File path is required';
        } else if (formData.type === 'webhook') {
          if (!formData.connection_config?.url) errors.url = 'Webhook URL is required';
        }
        break;
      case 3: // Module & Query & Settings
        if (formData.type === 'internal_module') {
          if (!formData.module?.module_name) errors.module_name = 'Module is required';
          if (!formData.module?.fact_tables) errors.fact_tables = 'Table is required';
        }
        if (!formData.query || !formData.query.trim()) errors.query = 'Query is required';
        if (!formData.sync_frequency || formData.sync_frequency < 60) errors.sync_frequency = 'Sync frequency must be at least 60 seconds';
        break;
    }
    
    return errors;
  };

  const canProceedToNext = () => {
    if (!formData) return false;
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
    
    setIsDirty(true);
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
    
    setIsDirty(true);
  };

  const handleJsonChange = (name, value) => {
    try {
      const parsed = value ? JSON.parse(value) : {};
      setFormData((prev) => ({ ...prev, [name]: parsed }));
      setIsDirty(true);
      
      // Clear validation error when field is updated
      if (validationErrors[name]) {
        setValidationErrors(prev => ({ ...prev, [name]: null }));
      }
    } catch (err) {
      setValidationErrors(prev => ({ ...prev, [name]: `Invalid JSON in ${name}` }));
    }
  };

  // Handle module_name,fact_tables selection
  const handleModuleNameChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      module: { ...prev.module, module_name: e.target.value }
    }));
    setIsDirty(true);
  };

  const handleFactTablesChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      module: { ...prev.module, fact_tables: e.target.value }
    }));
    setIsDirty(true);
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
      const testResult = await testConnection(id);
      
      setTestResult({
        success: true,
        message: 'Connection test successful!',
        data: testResult.data
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canProceedToNext()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateDataSource(id, formData);
      setSuccess(true);
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
  
  // Helper functions for rendering
  const getStepIcon = (step) => {
    switch (step) {
      case 1: return <MdStorage className="w-5 h-5" />;
      case 2: return <MdSettings className="w-5 h-5" />;
      case 3: return <MdCode className="w-5 h-5" />;
      default: return <MdCheck className="w-5 h-5" />;
    }
  };

  const getStepTitle = (step) => {
    switch (step) {
      case 1: return 'Basic Information';
      case 2: return 'Connection Details';
      case 3: return 'Module & Query';
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

  if (loading || !formData) {
    return <LoadingSpinner size="lg" text="Loading DataSource..." />;
  }

  return (
    <div className="">
      <div className="max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button
              onClick={() => navigate(`/dashboard/integration/view/${id}`)}
              variant="outline"
              size="sm"
              icon={<MdArrowBack className="w-4 h-4" />}
            >
              Back to Details
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Data Source</h1>
          </div>
          <p className="text-gray-600">Update your data source configuration</p>
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

        {/* Success Alert */}
        {success && (
          <Alert
            type="success"
            title="Success"
            message="DataSource updated successfully!"
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
                  <p className="text-gray-600">Update basic details about your data source</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Source Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ""}
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
                      value={formData.description || ""}
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
                          (formData.type || "") === type.value
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
                  <p className="text-gray-600">Update the connection settings for your data source</p>
                </div>

                {/* Connection form will be rendered here based on type */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Connection Configuration (JSON)
                    </label>
                    <div className="border border-gray-300 rounded-md overflow-hidden">
                      <JSONEditor
                        value={JSON.stringify(formData.connection_config, null, 2)}
                        onChange={(value) => handleJsonChange('connection_config', value)}
                        height="300px"
                      />
                    </div>
                    {validationErrors.connection_config && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.connection_config}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Enter connection details like host, port, username, etc.
                    </p>
                  </div>
                </div>

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

            {/* Step 3: Module & Query & Settings */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                    <MdCode className="w-8 h-8 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Module & Query Configuration</h2>
                  <p className="text-gray-600">Update module settings, data query, and sync preferences</p>
                </div>

                {/* Module Configuration */}
                {formData.type === 'internal_module' && (
                  <Card className="p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MdStorage className="w-5 h-5 text-blue-600" />
                        Module Configuration
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Module *
                          </label>
                          <select
                            value={formData.module?.module_name || ""}
                            onChange={handleModuleNameChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select a module</option>
                            <option value="hr">Human Resources</option>
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
                          {validationErrors.module_name && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.module_name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data Table *
                          </label>
                          <input
                            type="text"
                            value={formData.module?.fact_tables || ""}
                            onChange={handleFactTablesChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter table name"
                          />
                          {validationErrors.fact_tables && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.fact_tables}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Query Configuration */}
                <Card className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MdCode className="w-5 h-5 text-green-600" />
                      Data Query Configuration
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Query *
                      </label>
                      <div className="relative">
                        <textarea
                          name="query"
                          value={formData.query || ""}
                          onChange={handleChange}
                          rows={8}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                            validationErrors.query ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your SQL query or data extraction query..."
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Tooltip content="Clear query">
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, query: '' }))}
                              className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                            >
                              <MdRefresh className="w-4 h-4 text-gray-500" />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                      {validationErrors.query && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.query}</p>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Sync Settings */}
                <Card className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MdSchedule className="w-5 h-5 text-orange-600" />
                      Sync Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sync Frequency (seconds) *
                        </label>
                        <input
                          type="number"
                          name="sync_frequency"
                          value={formData.sync_frequency || 3600}
                          onChange={handleChange}
                          min="60"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            validationErrors.sync_frequency ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {validationErrors.sync_frequency && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors.sync_frequency}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                          Minimum: 60 seconds (1 minute)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status || "active"}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="error">Error</option>
                          <option value="pending">Pending</option>
                        </select>
                        <p className="mt-1 text-sm text-gray-500">
                          Current status of the data source
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
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
                    variant="success"
                    disabled={saving || !canProceedToNext()}
                    loading={saving}
                    icon={saving ? <MdRefresh className="w-4 h-4 animate-spin" /> : <MdSave className="w-4 h-4" />}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DataSourceEdit;
