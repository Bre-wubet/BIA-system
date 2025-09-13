import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReportTemplates, createReportFromTemplate } from '../../../api/reportsApi';
import { ROLES } from '../../../constants/roles';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

import { MdAdd, MdPreview, MdContentCopy } from 'react-icons/md';

const ReportTemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [userRole, setUserRole] = useState(ROLES.ADMIN);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await getReportTemplates();
      setTemplates(res.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromTemplate = async (templateId) => {
    try {
      const res = await createReportFromTemplate(templateId);
      navigate(`/reports/${res.data.id}/edit`);
    } catch (error) {
      console.error('Error creating report from template:', error);
    }
  };

  const categories = [
    { key: '', label: 'All Categories' },
    { key: 'financial', label: 'Financial' },
    { key: 'sales', label: 'Sales' },
    { key: 'hr', label: 'HR' },
    { key: 'operations', label: 'Operations' },
    { key: 'marketing', label: 'Marketing' },
    { key: 'executive', label: 'Executive' }
  ];

  const filteredTemplates = templates.filter(template => 
    !selectedCategory || template.category === selectedCategory
  );

  const getRoleBasedTemplates = () => {
    const roleTemplates = {
      [ROLES.ADMIN]: templates,
      [ROLES.MANAGER]: templates.filter(t => ['executive', 'management', 'sales', 'hr', 'finance', 'operations'].includes(t.category)),
      [ROLES.ANALYST]: templates.filter(t => ['analytics', 'data_analysis', 'custom'].includes(t.category)),
      [ROLES.VIEWER]: templates.filter(t => t.is_public),
      [ROLES.SALES]: templates.filter(t => ['sales', 'marketing', 'customer'].includes(t.category)),
      [ROLES.HR]: templates.filter(t => ['hr', 'employee', 'performance'].includes(t.category)),
      [ROLES.FINANCE]: templates.filter(t => ['finance', 'budget', 'revenue'].includes(t.category)),
      [ROLES.OPERATIONS]: templates.filter(t => ['operations', 'supply_chain', 'inventory'].includes(t.category))
    };
    return roleTemplates[userRole] || templates;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const displayTemplates = selectedCategory ? filteredTemplates : getRoleBasedTemplates();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Report Templates</h1>
          <p className="text-gray-600">Choose from pre-built report templates</p>
        </div>
        <Button onClick={() => navigate('/reports/new')} variant="primary">
          <MdAdd className="w-4 h-4 mr-2" />
          Create Custom Report
        </Button>
      </div>

      {/* Category Filter */}
      <Card>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              {/* Template Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  template.category === 'financial' ? 'bg-green-100 text-green-800' :
                  template.category === 'sales' ? 'bg-blue-100 text-blue-800' :
                  template.category === 'hr' ? 'bg-purple-100 text-purple-800' :
                  template.category === 'operations' ? 'bg-orange-100 text-orange-800' :
                  template.category === 'marketing' ? 'bg-pink-100 text-pink-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {template.category}
                </span>
              </div>

              {/* Template Features */}
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <strong>Data Sources:</strong> {template.data_sources?.join(', ') || 'Multiple'}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Refresh:</strong> {template.refresh_interval || 'Manual'}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Complexity:</strong> {template.complexity || 'Medium'}
                </div>
              </div>

              {/* Template Preview */}
              {template.preview_image && (
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <img 
                    src={template.preview_image} 
                    alt={template.name}
                    className="mx-auto max-h-32 object-contain"
                  />
                </div>
              )}

              {/* Template Actions */}
              <div className="flex space-x-2 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => handleCreateFromTemplate(template.id)}
                  variant="primary"
                  size="sm"
                  className="flex-1"
                >
                  <MdContentCopy className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
                <Button
                  onClick={() => navigate(`/reports/templates/${template.id}`)}
                  variant="outline"
                  size="sm"
                >
                  <MdPreview className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {displayTemplates.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">No templates found for the selected category.</p>
          </div>
        </Card>
      )}

      {/* Popular Templates Section */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates
            .filter(template => template.is_popular)
            .slice(0, 4)
            .map(template => (
              <div key={template.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    template.category === 'financial' ? 'bg-green-500' :
                    template.category === 'sales' ? 'bg-blue-500' :
                    template.category === 'hr' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`} />
                  <div>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.category}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};

export default ReportTemplatesPage;
