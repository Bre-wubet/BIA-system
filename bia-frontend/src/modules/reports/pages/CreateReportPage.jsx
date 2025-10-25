import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReport, getReportTemplates, getReportTypes, getReportCategories } from '../../../api/reportsApi';
import { getAllDataSources } from '../../../api/integrationApi';
import { ROLES } from '../../../constants/roles';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import ReportBuilder from '../components/ReportBuilder';
import ReportPreview from '../components/ReportPreview';

import { MdArrowBack, MdSave, MdPreview, MdSettings, MdAdd, MdRemove } from 'react-icons/md';

const CreateReportPage = () => {
  const [reportData, setReportData] = useState({
    name: '',
    description: '',
    type: '',
    category: '',
    involved_modules: [],
    query_config: {
      data_source: '',
      query: '',
      parameters: {}
    },
    parameters: {},
    schedule: '',
    format: 'pdf',
    recipients: [],
    is_public: false,
    allow_download: false,
    allowed_roles: [],
    expires_at: null,
    share_password: '',
    layout: {
      elements: []
    }
  });
  const [dataSources, setDataSources] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [reportTypes, setReportTypes] = useState([]);
  const [reportCategories, setReportCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [previewData, setPreviewData] = useState(null);
  const [errors, setErrors] = useState({});
  const [newRecipient, setNewRecipient] = useState('');
  const [newParameter, setNewParameter] = useState({ key: '', value: '' });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDataSources();
    fetchTemplates();
    fetchReportTypes();
    fetchReportCategories();
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
      const res = await getReportTemplates();
      setTemplates(res.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchReportTypes = async () => {
    try {
      const res = await getReportTypes();
      setReportTypes(res.data || []);
    } catch (error) {
      console.error('Error fetching report types:', error);
    }
  };

  const fetchReportCategories = async () => {
    try {
      const res = await getReportCategories();
      setReportCategories(res.data || []);
    } catch (error) {
      console.error('Error fetching report categories:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!reportData.name.trim()) {
      newErrors.name = 'Report name is required';
    } else if (reportData.name.length > 255) {
      newErrors.name = 'Report name must be less than 255 characters';
    }
    
    if (reportData.description && reportData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }
    
    if (!reportData.type) {
      newErrors.type = 'Report type is required';
    }
    
    if (!reportData.category) {
      newErrors.category = 'Category is required';
    } else if (reportData.category.length > 100) {
      newErrors.category = 'Category must be less than 100 characters';
    }
    
    if (!reportData.query_config.data_source) {
      newErrors.data_source = 'Data source is required';
    }
    
    if (!reportData.query_config.query.trim()) {
      newErrors.query = 'SQL query is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      await createReport(reportData);
      navigate('/dashboard/reports');
    } catch (error) {
      console.error('Error creating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRecipient = () => {
    if (newRecipient.trim() && !reportData.recipients.includes(newRecipient.trim())) {
      setReportData({
        ...reportData,
        recipients: [...reportData.recipients, newRecipient.trim()]
      });
      setNewRecipient('');
    }
  };

  const removeRecipient = (index) => {
    setReportData({
      ...reportData,
      recipients: reportData.recipients.filter((_, i) => i !== index)
    });
  };

  const addParameter = () => {
    if (newParameter.key.trim() && newParameter.value.trim()) {
      setReportData({
        ...reportData,
        parameters: {
          ...reportData.parameters,
          [newParameter.key.trim()]: newParameter.value.trim()
        }
      });
      setNewParameter({ key: '', value: '' });
    }
  };

  const removeParameter = (key) => {
    const newParameters = { ...reportData.parameters };
    delete newParameters[key];
    setReportData({
      ...reportData,
      parameters: newParameters
    });
  };

  const addInvolvedModule = (module) => {
    if (!reportData.involved_modules.includes(module)) {
      setReportData({
        ...reportData,
        involved_modules: [...reportData.involved_modules, module]
      });
    }
  };

  const removeInvolvedModule = (module) => {
    setReportData({
      ...reportData,
      involved_modules: reportData.involved_modules.filter(m => m !== module)
    });
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setReportData({
      ...reportData,
      name: template.name || '',
      description: template.description || '',
      type: template.type || '',
      category: template.category || '',
      involved_modules: template.involved_modules || [],
      query_config: template.query_config || { data_source: '', query: '', parameters: {} },
      parameters: template.parameters || {},
      format: template.format || 'pdf',
      recipients: template.recipients || [],
      is_public: template.is_public || false,
      allow_download: template.allow_download || false,
      allowed_roles: template.allowed_roles || [],
      layout: template.layout || { elements: [] }
    });
  };

  const clearTemplate = () => {
    setSelectedTemplate(null);
    setReportData({
      name: '',
      description: '',
      type: '',
      category: '',
      involved_modules: [],
      query_config: { data_source: '', query: '', parameters: {} },
      parameters: {},
      schedule: '',
      format: 'pdf',
      recipients: [],
      is_public: false,
      allow_download: false,
      allowed_roles: [],
      expires_at: null,
      share_password: '',
      layout: {
        elements: []
      }
    });
  };

  const handlePreview = () => {
    // Mock preview data - in real app, this would call the API
    setPreviewData({
      columns: ['Date', 'Revenue', 'Profit', 'Margin'],
      rows: [
        ['2024-01-01', '$10,000', '$2,000', '20%'],
        ['2024-01-02', '$12,000', '$2,400', '20%'],
        ['2024-01-03', '$8,000', '$1,600', '20%']
      ]
    });
  };

  const steps = [
    { id: 1, name: 'Basic Info', description: 'Report name, type and description' },
    { id: 2, name: 'Data Source', description: 'Select data source and query' },
    { id: 3, name: 'Configuration', description: 'Parameters and modules' },
    { id: 4, name: 'Sharing', description: 'Recipients and permissions' },
    { id: 5, name: 'Schedule', description: 'Set up scheduling (optional)' },
    { id: 6, name: 'Preview', description: 'Preview and finalize' }
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
                      <p className="text-sm text-gray-500">Create a new report from the beginning</p>
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
                            {template.type}
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
                Report Name *
              </label>
              <input
                type="text"
                value={reportData.name}
                onChange={(e) => setReportData({...reportData, name: e.target.value})}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter report name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type *
              </label>
              <select
                value={reportData.type}
                onChange={(e) => setReportData({...reportData, type: e.target.value})}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select report type</option>
                {reportTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
                <option value="financial">Financial</option>
                <option value="sales">Sales</option>
                <option value="operational">Operational</option>
                <option value="analytical">Analytical</option>
                <option value="custom">Custom</option>
              </select>
              {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={reportData.description}
                onChange={(e) => setReportData({...reportData, description: e.target.value})}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
                placeholder="Enter report description"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={reportData.category}
                onChange={(e) => setReportData({...reportData, category: e.target.value})}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select category</option>
                {reportCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
                <option value="financial">Financial</option>
                <option value="sales">Sales</option>
                <option value="hr">HR</option>
                <option value="operations">Operations</option>
                <option value="marketing">Marketing</option>
                <option value="custom">Custom</option>
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <select
                value={reportData.format}
                onChange={(e) => setReportData({...reportData, format: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
                <option value="html">HTML</option>
              </select>
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
                value={reportData.query_config.data_source}
                onChange={(e) => setReportData({
                  ...reportData, 
                  query_config: {...reportData.query_config, data_source: e.target.value}
                })}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.data_source ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select data source</option>
                {dataSources.map(source => (
                  <option key={source.id} value={source.id}>
                    {source.name} ({source.type})
                  </option>
                ))}
              </select>
              {errors.data_source && <p className="text-red-500 text-sm mt-1">{errors.data_source}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SQL Query *
              </label>
              <textarea
                value={reportData.query_config.query}
                onChange={(e) => setReportData({
                  ...reportData, 
                  query_config: {...reportData.query_config, query: e.target.value}
                })}
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
                Involved Modules
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {['sales', 'finance', 'hr', 'operations', 'marketing', 'inventory'].map(module => (
                    <button
                      key={module}
                      type="button"
                      onClick={() => 
                        reportData.involved_modules.includes(module) 
                          ? removeInvolvedModule(module)
                          : addInvolvedModule(module)
                      }
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        reportData.involved_modules.includes(module)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {module}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Select modules that this report involves
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Parameters
              </label>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newParameter.key}
                    onChange={(e) => setNewParameter({...newParameter, key: e.target.value})}
                    placeholder="Parameter key"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={newParameter.value}
                    onChange={(e) => setNewParameter({...newParameter, value: e.target.value})}
                    placeholder="Default value"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button onClick={addParameter} variant="outline" size="sm">
                    <MdAdd className="w-4 h-4" />
                  </Button>
                </div>
                
                {Object.keys(reportData.parameters).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(reportData.parameters).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">
                          <strong>{key}:</strong> {value}
                        </span>
                        <Button 
                          onClick={() => removeParameter(key)} 
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

            <div>
              <ReportBuilder
                reportData={reportData}
                onReportDataChange={setReportData}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Recipients
              </label>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                  />
                  <Button onClick={addRecipient} variant="outline" size="sm">
                    <MdAdd className="w-4 h-4" />
                  </Button>
                </div>
                
                {reportData.recipients.length > 0 && (
                  <div className="space-y-2">
                    {reportData.recipients.map((recipient, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{recipient}</span>
                        <Button 
                          onClick={() => removeRecipient(index)} 
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

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={reportData.is_public}
                  onChange={(e) => setReportData({...reportData, is_public: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
                  Make this report public
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allow_download"
                  checked={reportData.allow_download}
                  onChange={(e) => setReportData({...reportData, allow_download: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allow_download" className="ml-2 block text-sm text-gray-900">
                  Allow download
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed Roles
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {Object.values(ROLES).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        const newRoles = reportData.allowed_roles.includes(role)
                          ? reportData.allowed_roles.filter(r => r !== role)
                          : [...reportData.allowed_roles, role];
                        setReportData({...reportData, allowed_roles: newRoles});
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        reportData.allowed_roles.includes(role)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Select roles that can access this report
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={reportData.expires_at ? new Date(reportData.expires_at).toISOString().slice(0, 16) : ''}
                onChange={(e) => setReportData({...reportData, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share Password (Optional)
              </label>
              <input
                type="password"
                value={reportData.share_password}
                onChange={(e) => setReportData({...reportData, share_password: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password for report access"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule (Optional)
              </label>
              <select
                value={reportData.schedule}
                onChange={(e) => setReportData({...reportData, schedule: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No scheduling</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Select how often this report should be automatically generated
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Scheduling Information</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Scheduled reports will be automatically generated and sent to recipients</li>
                <li>• You can modify the schedule later from the report settings</li>
                <li>• Reports are generated at 9:00 AM in your timezone</li>
                <li>• Make sure to add recipients in the previous step for scheduled reports</li>
              </ul>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Report Preview</h3>
              <Button onClick={handlePreview} variant="outline">
                <MdPreview className="w-4 h-4 mr-2" />
                Generate Preview
              </Button>
            </div>
            {previewData ? (
              <ReportPreview data={previewData} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                Click "Generate Preview" to see your report
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Report Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {reportData.name}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {reportData.type}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {reportData.category}
                </div>
                <div>
                  <span className="font-medium">Format:</span> {reportData.format.toUpperCase()}
                </div>
                <div>
                  <span className="font-medium">Modules:</span> {reportData.involved_modules.join(', ') || 'None'}
                </div>
                <div>
                  <span className="font-medium">Recipients:</span> {reportData.recipients.length}
                </div>
                <div>
                  <span className="font-medium">Schedule:</span> {reportData.schedule || 'None'}
                </div>
                <div>
                  <span className="font-medium">Public:</span> {reportData.is_public ? 'Yes' : 'No'}
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
            onClick={() => navigate('/dashboard/reports')}
            variant="outline"
            size="sm"
          >
            <MdArrowBack className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Create Report</h1>
            <p className="text-gray-600">Build a new business report</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handlePreview} variant="outline">
            <MdPreview className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} variant="primary" loading={loading}>
            <MdSave className="w-4 h-4 mr-2" />
            Save Report
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
            >
              <MdSave className="w-4 h-4 mr-2" />
              Create Report
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

export default CreateReportPage;
