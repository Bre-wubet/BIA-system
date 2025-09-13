import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReportById, updateReport } from '../../../api/reportsApi';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import ReportBuilder from '../components/ReportBuilder';

import { MdArrowBack, MdSave, MdPreview } from 'react-icons/md';

const ReportEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await getReportById(id);
      setReport(res.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateReport(id, report);
      navigate(`/reports/${id}`);
    } catch (error) {
      console.error('Error updating report:', error);
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { id: 1, name: 'Basic Info', description: 'Report name and description' },
    { id: 2, name: 'Data Source', description: 'Select data source and query' },
    { id: 3, name: 'Layout', description: 'Design report layout' },
    { id: 4, name: 'Schedule', description: 'Set up scheduling' }
  ];

  const renderStepContent = () => {
    if (!report) return null;

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
                value={report.name}
                onChange={(e) => setReport({...report, name: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter report name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={report.description}
                onChange={(e) => setReport({...report, description: e.target.value})}
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
                value={report.category}
                onChange={(e) => setReport({...report, category: e.target.value})}
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
                checked={report.is_public}
                onChange={(e) => setReport({...report, is_public: e.target.checked})}
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
                SQL Query *
              </label>
              <textarea
                value={report.query}
                onChange={(e) => setReport({...report, query: e.target.value})}
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
              reportData={report}
              onReportDataChange={setReport}
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
                checked={report.is_scheduled}
                onChange={(e) => setReport({...report, is_scheduled: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_scheduled" className="ml-2 block text-sm text-gray-900">
                Enable automatic scheduling
              </label>
            </div>
            {report.is_scheduled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={report.schedule_config?.frequency || ''}
                    onChange={(e) => setReport({
                      ...report, 
                      schedule_config: {...report.schedule_config, frequency: e.target.value}
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
                    value={report.schedule_config?.recipients || ''}
                    onChange={(e) => setReport({
                      ...report, 
                      schedule_config: {...report.schedule_config, recipients: e.target.value}
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email1@company.com, email2@company.com"
                  />
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Report not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate(`/reports/${id}`)}
            variant="outline"
            size="sm"
          >
            <MdArrowBack className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Edit Report</h1>
            <p className="text-gray-600">Modify report settings and configuration</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleSave} variant="primary" loading={saving}>
            <MdSave className="w-4 h-4 mr-2" />
            Save Changes
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

export default ReportEditPage;
