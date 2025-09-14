import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportData as createExport, getExportTemplates } from '../../../api/exportsApi';
import { getAllDataSources } from '../../../api/integrationApi';
import { ROLES } from '../../../constants/roles';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import ExportBuilder from '../components/ExportBuilder';
import ExportPreview from '../components/ExportPreview';

import { MdArrowBack, MdSave, MdPreview, MdDownload, MdAdd, MdRemove, MdSettings } from 'react-icons/md';

const CreateExportPage = () => {
  const [exportData, setExportData] = useState({
    // Basic info
    name: '',
    description: '',
    data_type: '',
    data_id: null,
    format: 'csv',
    filename: '',
    
    // Data source and query
    dataSource: '',
    query: '',
    
    // Filters and options (JSONB fields)
    filters: {},
    options: {},
    
    // Scheduling
    schedule: {},
    is_scheduled: false,
    
    // Permissions
    is_public: false,
    role: ROLES.ANALYST
  });
  const [dataSources, setDataSources] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [dataTypes, setDataTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [previewData, setPreviewData] = useState(null);
  const [errors, setErrors] = useState({});
  const [newFilter, setNewFilter] = useState({ key: '', value: '' });
  const [newOption, setNewOption] = useState({ key: '', value: '' });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDataSources();
    fetchTemplates();
    fetchDataTypes();
  }, []);

  const fetchDataSources = async () => {
    try {
      const res = await getAllDataSources();
      setDataSources(res.data || []);
    } catch (error) {
      console.error('Error fetching data sources:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await getExportTemplates();
      setTemplates(res.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchDataTypes = async () => {
    // Set default data types based on Export.js schema and service constants
    setDataTypes(['dashboard', 'report', 'kpi', 'analytics', 'custom']);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!exportData.name.trim()) {
      newErrors.name = 'Export name is required';
    } else if (exportData.name.length > 255) {
      newErrors.name = 'Export name must be less than 255 characters';
    }
    
    if (!exportData.data_type) {
      newErrors.data_type = 'Data type is required';
    }
    
    if (!exportData.format) {
      newErrors.format = 'Format is required';
    }
    
    if (!exportData.dataSource) {
      newErrors.dataSource = 'Data source is required';
    }
    
    if (!exportData.query.trim()) {
      newErrors.query = 'Query is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return exportData.name.trim() && 
           exportData.data_type && 
           exportData.format && 
           exportData.dataSource && 
           exportData.query.trim();
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    // Additional validation to ensure required fields are not empty
    if (!exportData.data_type || !exportData.format) {
      console.error('Missing required fields:', { data_type: exportData.data_type, format: exportData.format });
      return;
    }
    
    try {
      setLoading(true);
      
      // Generate filename if not provided
      const filename = exportData.filename || `${exportData.name.replace(/[^a-zA-Z0-9]/g, '_')}.${exportData.format}`;
      
      // Prepare export data according to backend validation schema
      const exportPayload = {
        dataType: exportData.data_type,
        format: exportData.format,
        filters: exportData.filters,
        includeHeaders: exportData.options?.include_headers || true
      };
      
      // Debug logging
      console.log('Export payload:', exportPayload);
      console.log('Export data:', exportData);
      
      await createExport(exportPayload.dataType, exportPayload.filters, exportPayload.format, exportPayload.includeHeaders);
      navigate('/exports');
    } catch (error) {
      console.error('Error creating export:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFilter = () => {
    if (newFilter.key.trim() && newFilter.value.trim()) {
      setExportData({
        ...exportData,
        filters: {
          ...exportData.filters,
          [newFilter.key.trim()]: newFilter.value.trim()
        }
      });
      setNewFilter({ key: '', value: '' });
    }
  };

  const removeFilter = (key) => {
    const newFilters = { ...exportData.filters };
    delete newFilters[key];
    setExportData({
      ...exportData,
      filters: newFilters
    });
  };

  const addOption = () => {
    if (newOption.key.trim() && newOption.value.trim()) {
      setExportData({
        ...exportData,
        options: {
          ...exportData.options,
          [newOption.key.trim()]: newOption.value.trim()
        }
      });
      setNewOption({ key: '', value: '' });
    }
  };

  const removeOption = (key) => {
    const newOptions = { ...exportData.options };
    delete newOptions[key];
    setExportData({
      ...exportData,
      options: newOptions
    });
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setExportData({
      ...exportData,
      name: template.name || '',
      description: template.description || '',
      data_type: template.data_type || '',
      format: template.format || 'csv',
      filters: template.filters || {},
      options: template.options || {}
    });
  };

  const clearTemplate = () => {
    setSelectedTemplate(null);
    setExportData({
      name: '',
      description: '',
      data_type: '',
      data_id: null,
      format: 'csv',
      filename: '',
      dataSource: '',
      query: '',
      filters: {},
      options: {},
      schedule: {},
      is_scheduled: false,
      is_public: false,
      role: ROLES.ANALYST
    });
  };

  const handlePreview = () => {
    // Mock preview data - in real app, this would call the API
    setPreviewData({
      columns: ['Date', 'Value', 'Category', 'Status'],
      rows: [
        ['2024-01-01', '$1,000', 'Sales', 'Active'],
        ['2024-01-02', '$1,500', 'Sales', 'Active'],
        ['2024-01-03', '$800', 'Marketing', 'Pending']
      ],
      format: exportData.format,
      totalRows: 3
    });
  };

  const steps = [
    { id: 1, name: 'Basic Info', description: 'Export name, type and description' },
    { id: 2, name: 'Data Source', description: 'Select data source and query' },
    { id: 3, name: 'Format & Options', description: 'Choose format and configure options' },
    { id: 4, name: 'Filters', description: 'Apply filters and data options' },
    { id: 5, name: 'Schedule', description: 'Set up scheduling (optional)' },
    { id: 6, name: 'Preview', description: 'Preview and finalize' }
  ];

  const formats = [
    { value: 'csv', label: 'CSV', description: 'Comma-separated values' },
    { value: 'excel', label: 'Excel', description: 'Microsoft Excel format' },
    { value: 'pdf', label: 'PDF', description: 'Portable Document Format' },
    { value: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
    { value: 'xml', label: 'XML', description: 'Extensible Markup Language' }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Template Selection */}
            {templates.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start from Template (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div
                    onClick={clearTemplate}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      !selectedTemplate
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                        <MdAdd className="w-4 h-4 text-gray-600" />
                      </div>
                      <h3 className="font-medium text-gray-900">Start from Scratch</h3>
                      <p className="text-sm text-gray-500">Create a new export from the beginning</p>
                    </div>
                  </div>
                  {templates.map(template => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                          <MdSettings className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-500">{template.description}</p>
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            {template.data_type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedTemplate && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Selected Template:</strong> {selectedTemplate.name}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      You can modify any fields below. The template provides a starting point.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Name *
              </label>
              <input
                type="text"
                value={exportData.name}
                onChange={(e) => setExportData({...exportData, name: e.target.value})}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter export name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={exportData.description}
                onChange={(e) => setExportData({...exportData, description: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter export description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Type *
              </label>
              <select
                value={exportData.data_type}
                onChange={(e) => setExportData({...exportData, data_type: e.target.value})}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.data_type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select data type</option>
                {dataTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
              {errors.data_type && <p className="text-red-500 text-sm mt-1">{errors.data_type}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filename (Optional)
              </label>
              <input
                type="text"
                value={exportData.filename}
                onChange={(e) => setExportData({...exportData, filename: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Leave empty for auto-generated filename"
              />
              <p className="text-sm text-gray-500 mt-1">
                If empty, filename will be auto-generated from export name
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_public"
                checked={exportData.is_public}
                onChange={(e) => setExportData({...exportData, is_public: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
                Make this export public
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Source *
              </label>
              <select
                value={exportData.dataSource}
                onChange={(e) => setExportData({...exportData, dataSource: e.target.value})}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dataSource ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select data source</option>
                {dataSources.map(source => (
                  <option key={source.id} value={source.id}>
                    {source.name} ({source.type})
                  </option>
                ))}
              </select>
              {errors.dataSource && <p className="text-red-500 text-sm mt-1">{errors.dataSource}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SQL Query *
              </label>
              <textarea
                value={exportData.query}
                onChange={(e) => setExportData({...exportData, query: e.target.value})}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                  errors.query ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={8}
                placeholder="SELECT * FROM table_name WHERE condition"
              />
              {errors.query && <p className="text-red-500 text-sm mt-1">{errors.query}</p>}
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Query Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use standard SQL syntax</li>
                <li>• Available tables: sales, customers, products, employees</li>
                <li>• Use parameters like {`{date_range}`} for dynamic filtering</li>
                <li>• Test your query before saving</li>
              </ul>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formats.map(format => (
                  <div
                    key={format.value}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      exportData.format === format.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setExportData({...exportData, format: format.value})}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        exportData.format === format.value ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{format.label}</h4>
                        <p className="text-sm text-gray-600">{format.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {errors.format && <p className="text-red-500 text-sm mt-1">{errors.format}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Options
              </label>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newOption.key}
                    onChange={(e) => setNewOption({...newOption, key: e.target.value})}
                    placeholder="Option key"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={newOption.value}
                    onChange={(e) => setNewOption({...newOption, value: e.target.value})}
                    placeholder="Option value"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button onClick={addOption} variant="outline" size="sm">
                    <MdAdd className="w-4 h-4" />
                  </Button>
                </div>
                
                {Object.keys(exportData.options).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(exportData.options).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">
                          <strong>{key}:</strong> {value}
                        </span>
                        <Button 
                          onClick={() => removeOption(key)} 
                          variant="outline" 
                          size="sm"
                        >
                          <MdRemove className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <ExportBuilder
              exportData={exportData}
              onExportDataChange={setExportData}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Filters
              </label>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newFilter.key}
                    onChange={(e) => setNewFilter({...newFilter, key: e.target.value})}
                    placeholder="Filter key"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={newFilter.value}
                    onChange={(e) => setNewFilter({...newFilter, value: e.target.value})}
                    placeholder="Filter value"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button onClick={addFilter} variant="outline" size="sm">
                    <MdAdd className="w-4 h-4" />
                  </Button>
                </div>
                
                {Object.keys(exportData.filters).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(exportData.filters).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">
                          <strong>{key}:</strong> {value}
                        </span>
                        <Button 
                          onClick={() => removeFilter(key)} 
                          variant="outline" 
                          size="sm"
                        >
                          <MdRemove className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Filters will be applied to the data before export. Use these to limit or transform the data.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Common Filter Examples</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>date_range:</strong> "2024-01-01,2024-12-31"</li>
                <li>• <strong>status:</strong> "active"</li>
                <li>• <strong>category:</strong> "sales,marketing"</li>
                <li>• <strong>limit:</strong> "1000"</li>
              </ul>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_scheduled"
                checked={exportData.is_scheduled}
                onChange={(e) => setExportData({...exportData, is_scheduled: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_scheduled" className="ml-2 block text-sm text-gray-900">
                Enable automatic scheduling
              </label>
            </div>
            {exportData.is_scheduled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={exportData.schedule.frequency || ''}
                    onChange={(e) => setExportData({
                      ...exportData, 
                      schedule: {...exportData.schedule, frequency: e.target.value}
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select frequency</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Recipients
                  </label>
                  <input
                    type="text"
                    value={exportData.schedule.recipients || ''}
                    onChange={(e) => setExportData({
                      ...exportData, 
                      schedule: {...exportData.schedule, recipients: e.target.value}
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email1@company.com, email2@company.com"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Export Preview</h3>
              <Button onClick={handlePreview} variant="outline">
                <MdPreview className="w-4 h-4 mr-2" />
                Generate Preview
              </Button>
            </div>
            {previewData ? (
              <ExportPreview data={previewData} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                Click "Generate Preview" to see your export
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Export Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {exportData.name}
                </div>
                <div>
                  <span className="font-medium">Data Type:</span> {exportData.data_type}
                </div>
                <div>
                  <span className="font-medium">Format:</span> {exportData.format.toUpperCase()}
                </div>
                <div>
                  <span className="font-medium">Filename:</span> {exportData.filename || 'Auto-generated'}
                </div>
                <div>
                  <span className="font-medium">Filters:</span> {Object.keys(exportData.filters).length}
                </div>
                <div>
                  <span className="font-medium">Options:</span> {Object.keys(exportData.options).length}
                </div>
                <div>
                  <span className="font-medium">Scheduled:</span> {exportData.is_scheduled ? 'Yes' : 'No'}
                </div>
                <div>
                  <span className="font-medium">Public:</span> {exportData.is_public ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/exports')}
            variant="outline"
            size="sm"
          >
            <MdArrowBack className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Create Export</h1>
            <p className="text-gray-600">Build a new data export</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handlePreview} variant="outline">
            <MdPreview className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={handleSave} 
            variant="primary" 
            loading={loading}
            disabled={!isFormValid()}
          >
            <MdSave className="w-4 h-4 mr-2" />
            Save Export
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep >= step.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step.id}
              </div>
              <div className="ml-3">
                <div className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-900' : 'text-gray-500'
                }`}>
                  {step.name}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Step Content */}
      <Card>
        {renderStepContent()}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          variant="outline"
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <div className="flex space-x-3">
          {currentStep === steps.length ? (
            <Button
              onClick={handleSave}
              variant="primary"
              loading={loading}
              disabled={!isFormValid()}
            >
              <MdSave className="w-4 h-4 mr-2" />
              Create Export
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
              variant="primary"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateExportPage;
