import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportData, getExportTemplates } from '../../../api/exportsApi';
import { getAllDataSources } from '../../../api/integrationApi';
import { ROLES } from '../../../constants/roles';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import ExportBuilder from '../components/ExportBuilder';
import ExportPreview from '../components/ExportPreview';

import { MdArrowBack, MdSave, MdPreview, MdDownload } from 'react-icons/md';

const CreateExportPage = () => {
  const [exportData, setExportData] = useState({
    name: '',
    description: '',
    type: '',
    format: 'csv',
    dataSource: '',
    query: '',
    filters: {},
    schedule: {},
    is_public: false,
    is_scheduled: false,
    role: ROLES.ANALYST
  });
  const [dataSources, setDataSources] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [previewData, setPreviewData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDataSources();
    fetchTemplates();
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

  const handleSave = async () => {
    try {
      setLoading(true);
      await exportData(exportData.data, exportData.format, exportData.filename);
      navigate('/exports');
    } catch (error) {
      console.error('Error creating export:', error);
    } finally {
      setLoading(false);
    }
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
    { id: 1, name: 'Basic Info', description: 'Export name and description' },
    { id: 2, name: 'Data Source', description: 'Select data source and query' },
    { id: 3, name: 'Format & Filters', description: 'Choose format and apply filters' },
    { id: 4, name: 'Schedule', description: 'Set up scheduling (optional)' },
    { id: 5, name: 'Preview', description: 'Preview and finalize' }
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Name *
              </label>
              <input
                type="text"
                value={exportData.name}
                onChange={(e) => setExportData({...exportData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter export name"
              />
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
                Export Type *
              </label>
              <select
                value={exportData.type}
                onChange={(e) => setExportData({...exportData, type: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select export type</option>
                <option value="dashboard">Dashboard Export</option>
                <option value="report">Report Export</option>
                <option value="data">Data Export</option>
                <option value="custom">Custom Export</option>
              </select>
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select data source</option>
                {dataSources.map(source => (
                  <option key={source.id} value={source.id}>
                    {source.name} ({source.type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SQL Query *
              </label>
              <textarea
                value={exportData.query}
                onChange={(e) => setExportData({...exportData, query: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={8}
                placeholder="SELECT * FROM table_name WHERE condition"
              />
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

      case 5:
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
          <Button onClick={handleSave} variant="primary" loading={loading}>
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
        <Button
          onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
          variant="primary"
          disabled={currentStep === steps.length}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default CreateExportPage;
