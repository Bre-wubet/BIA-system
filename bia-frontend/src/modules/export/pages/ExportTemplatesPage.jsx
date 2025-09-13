import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExportTemplates, createExportTemplate } from '../../../api/exportsApi';
import { ROLES } from '../../../constants/roles';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

import { MdAdd, MdPreview, MdContentCopy } from 'react-icons/md';

const ExportTemplatesPage = () => {
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
      const res = await getExportTemplates();
      setTemplates(res.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromTemplate = async (templateId) => {
    try {
      const res = await createExportTemplate(templateData);
      navigate(`/exports/${res.data.id}/edit`);
    } catch (error) {
      console.error('Error creating export from template:', error);
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

  const formats = [
    { key: '', label: 'All Formats' },
    { key: 'csv', label: 'CSV' },
    { key: 'excel', label: 'Excel' },
    { key: 'pdf', label: 'PDF' },
    { key: 'json', label: 'JSON' },
    { key: 'xml', label: 'XML' }
  ];

  const [selectedFormat, setSelectedFormat] = useState('');

  const filteredTemplates = templates.filter(template => {
    if (selectedCategory && template.category !== selectedCategory) return false;
    if (selectedFormat && template.format !== selectedFormat) return false;
    return true;
  });

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

  const getFormatIcon = (format) => {
    switch (format) {
      case 'csv': return '📊';
      case 'excel': return '📈';
      case 'pdf': return '📄';
      case 'json': return '🔧';
      case 'xml': return '📋';
      default: return '📁';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'financial': return 'bg-green-100 text-green-800';
      case 'sales': return 'bg-blue-100 text-blue-800';
      case 'hr': return 'bg-purple-100 text-purple-800';
      case 'operations': return 'bg-orange-100 text-orange-800';
      case 'marketing': return 'bg-pink-100 text-pink-800';
      case 'executive': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const displayTemplates = (selectedCategory || selectedFormat) ? filteredTemplates : getRoleBasedTemplates();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Export Templates</h1>
          <p className="text-gray-600">Choose from pre-built export templates</p>
        </div>
        <Button onClick={() => navigate('/exports/new')} variant="primary">
          <MdAdd className="w-4 h-4 mr-2" />
          Create Custom Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Filters</h3>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.key} value={category.key}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {formats.map(format => (
                  <option key={format.key} value={format.key}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
            {(selectedCategory || selectedFormat) && (
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedFormat('');
                  }}
                  variant="outline"
                  size="sm"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              {/* Template Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <span className="text-2xl">{getFormatIcon(template.format)}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(template.category)}`}>
                    {template.category}
                  </span>
                </div>
              </div>

              {/* Template Features */}
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <strong>Format:</strong> {template.format?.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Data Sources:</strong> {template.data_sources?.join(', ') || 'Multiple'}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Complexity:</strong> {template.complexity || 'Medium'}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Estimated Rows:</strong> {template.estimated_rows || 'Variable'}
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
                  onClick={() => navigate(`/exports/templates/${template.id}`)}
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
            <p className="text-gray-500">No templates found for the selected filters.</p>
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
              <div 
                key={template.id} 
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleCreateFromTemplate(template.id)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFormatIcon(template.format)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.category} • {template.format?.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => navigate('/exports/new?type=dashboard')}
            variant="outline"
            className="p-4 h-auto flex flex-col items-center space-y-2"
          >
            <span className="text-2xl">📊</span>
            <span className="font-medium">Dashboard Export</span>
            <span className="text-sm text-gray-600">Export dashboard data</span>
          </Button>
          <Button
            onClick={() => navigate('/exports/new?type=report')}
            variant="outline"
            className="p-4 h-auto flex flex-col items-center space-y-2"
          >
            <span className="text-2xl">📄</span>
            <span className="font-medium">Report Export</span>
            <span className="text-sm text-gray-600">Export report data</span>
          </Button>
          <Button
            onClick={() => navigate('/exports/new?type=custom')}
            variant="outline"
            className="p-4 h-auto flex flex-col items-center space-y-2"
          >
            <span className="text-2xl">🔧</span>
            <span className="font-medium">Custom Export</span>
            <span className="text-sm text-gray-600">Create custom export</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ExportTemplatesPage;
