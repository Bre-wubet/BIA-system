import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReport, getReportTemplates } from '../../../api/reportsApi';
import { getAllDataSources } from '../../../api/integrationApi';
import { ROLES } from '../../../constants/roles';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import ReportBuilder from '../components/ReportBuilder';
import ReportPreview from '../components/ReportPreview';

import { MdArrowBack, MdSave, MdPreview, MdSettings } from 'react-icons/md';

const CreateReportPage = () => {
  const [reportData, setReportData] = useState({
    name: '',
    description: '',
    category: '',
    dataSource: '',
    query: '',
    filters: {},
    layout: {},
    is_public: false,
    is_scheduled: false,
    schedule_config: {},
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
      const res = await getReportTemplates();
      setTemplates(res.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await createReport(reportData);
      navigate('/reports');
    } catch (error) {
      console.error('Error creating report:', error);
    } finally {
      setLoading(false);
    }
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
    { id: 1, name: 'Basic Info', description: 'Report name and description' },
    { id: 2, name: 'Data Source', description: 'Select data source and query' },
    { id: 3, name: 'Layout', description: 'Design report layout' },
    { id: 4, name: 'Schedule', description: 'Set up scheduling (optional)' },
    { id: 5, name: 'Preview', description: 'Preview and finalize' }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Name *
              </label>
              <input
                type="text"
                value={reportData.name}
                onChange={(e) => setReportData({...reportData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter report name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={reportData.description}
                onChange={(e) => setReportData({...reportData, description: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter report description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={reportData.category}
                onChange={(e) => setReportData({...reportData, category: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                <option value="financial">Financial</option>
                <option value="sales">Sales</option>
                <option value="hr">HR</option>
                <option value="operations">Operations</option>
                <option value="marketing">Marketing</option>
                <option value="custom">Custom</option>
              </select>
            </div>
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
                value={reportData.dataSource}
                onChange={(e) => setReportData({...reportData, dataSource: e.target.value})}
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
                value={reportData.query}
                onChange={(e) => setReportData({...reportData, query: e.target.value})}
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
            <ReportBuilder
              reportData={reportData}
              onReportDataChange={setReportData}
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
                checked={reportData.is_scheduled}
                onChange={(e) => setReportData({...reportData, is_scheduled: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_scheduled" className="ml-2 block text-sm text-gray-900">
                Enable automatic scheduling
              </label>
            </div>
            {reportData.is_scheduled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={reportData.schedule_config.frequency || ''}
                    onChange={(e) => setReportData({
                      ...reportData, 
                      schedule_config: {...reportData.schedule_config, frequency: e.target.value}
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
                    value={reportData.schedule_config.recipients || ''}
                    onChange={(e) => setReportData({
                      ...reportData, 
                      schedule_config: {...reportData.schedule_config, recipients: e.target.value}
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
            onClick={() => navigate('/reports')}
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

export default CreateReportPage;
