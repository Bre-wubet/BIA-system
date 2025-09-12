import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllDashboards,
  getDashboardStats,
  createDashboard,
  duplicateDashboard,
  deleteDashboard,
  setDefaultDashboard
} from '../../../api/dashboardsApi';
// import { getAllWidgets } from '../../../api/widgetsApi';
import { DASHBOARD_TEMPLATES } from '../../../constants/chartConfig';
import { ROLE_DASHBOARDS, ROLES } from '../../../constants/roles';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import KPIWidget from '../../../components/charts/KPIWidget';
import { ROLE_PERMISSIONS } from '../../../constants/roles';

import { MdEdit, MdDelete, MdControlPointDuplicate} from 'react-icons/md';
const DashboardsPage = () => {
  const [dashboards, setDashboards] = useState([]);
  // const [widgets, setWidgets] = useState([]); // Assuming widgets are fetched from an API
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [userRole, setUserRole] = useState(ROLES.ADMIN); // Mock user role
  const navigate = useNavigate();
  useEffect(() => {
    fetchDashboards();
    fetchDashboardStats();
  }, []);

  const fetchDashboards = async () => {
    try {
      setLoading(true);
      const res = await getAllDashboards();
      setDashboards(res.data || []);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   const fetchWidgets = async () => {
  //     try {
  //       const res = await getAllWidgets();
  //       setWidgets(res.data || []);
  //     } catch (error) {
  //       console.error('Error fetching widgets:', error);
  //     }
  //   };

  //   fetchWidgets();
  // }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data || {});
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleCreateDashboard = async (templateData) => {
    try {
      const dashboardData = {
        name: templateData.name,
        description: templateData.description,
        user_id: 1, // Mock user ID
        layout: templateData.layout || {},
        filters: templateData.filters || {},
        is_public: false,
        is_default: false,
        refresh_interval: 3600
      };

      await createDashboard(dashboardData);
      setShowCreateModal(false);
      fetchDashboards();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error creating dashboard:', error);
    }
  };

  const handleDuplicateDashboard = async (dashboardId) => {
    try {
      await duplicateDashboard(dashboardId);
      fetchDashboards();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error duplicating dashboard:', error);
    }
  };

  const handleDeleteDashboard = async (dashboardId) => {
    if (window.confirm('Are you sure you want to delete this dashboard?')) {
      try {
        await deleteDashboard(dashboardId);
        fetchDashboards();
        fetchDashboardStats();
      } catch (error) {
        console.error('Error deleting dashboard:', error);
      }
    }
  };

  const handleSetDefault = async (dashboardId) => {
    try {
      await setDefaultDashboard(dashboardId);
      fetchDashboards();
    } catch (error) {
      console.error('Error setting default dashboard:', error);
    }
  };

  const getAvailableTemplates = () => {
    const roleDashboards = ROLE_DASHBOARDS[userRole] || [];
    return Object.values(DASHBOARD_TEMPLATES).filter(template => 
      roleDashboards.includes(template) || template === 'custom'
    );
  };

  const getTemplateData = (template) => {
    const templates = {
      sales: {
        name: 'Sales Dashboard',
        description: 'Monitor sales performance and metrics',
        layout: { columns: 3, rows: 4 },
        filters: [{ module: 'sales' }]
      },
      hr: {
        name: 'HR Dashboard',
        description: 'Track employee performance and HR metrics',
        layout: { columns: 3, rows: 4 },
        filters: [{ module: 'hr' }]
      },
      finance: {
        name: 'Finance Dashboard',
        description: 'Financial overview and budget tracking',
        layout: { columns: 3, rows: 4 },
        filters: [{ module: 'finance' }]
      },
      operations: {
        name: 'Operations Dashboard',
        description: 'Operational efficiency and process metrics',
        layout: { columns: 3, rows: 4 },
        filters: [{ module: 'operations' }]
      },
      analytics: {
        name: 'Analytics Dashboard',
        description: 'Advanced analytics and insights',
        layout: { columns: 4, rows: 5 },
        filters: [{ module: 'analytics' }]
      },
      executive: {
        name: 'Executive Dashboard',
        description: 'High-level business overview',
        layout: { columns: 3, rows: 3 },
        filters: [{ module: 'executive' }]
      },
      custom: {
        name: 'Custom Dashboard',
        description: 'Create your own dashboard layout',
        layout: { columns: 2, rows: 3 },
        widgets: []
      }
    };
    return templates[template] || templates.custom;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Dashboards</h1>
          <p className="text-gray-600">Create and manage your business dashboards</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowCreateModal(true)} variant="primary">
            Create Dashboard From Template
          </Button>
          <Button onClick={() => navigate(`/dashboards/new`)} variant="primary">
            New Dashboard
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIWidget
          title="Total Dashboards"
          value={dashboards.length || 0}
          icon={
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <KPIWidget
          title="Active Dashboards"
          value={dashboards.filter(dashboard => dashboard.is_active).length || 0}
          icon={
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPIWidget
          title="Public Dashboards"
          value={dashboards.filter(dashboard => dashboard.is_public).length || 0}
          icon={
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />
        {/* <KPIWidget
          title="Total Widgets"
          value={widgets.reduce((total, widget) => total + (widget.dashboard?.length || 0), 0) || 0}
          icon={
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          }
        /> */}
      </div>

      {/* Dashboards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {dashboards.map(dashboard => (
          <Card key={dashboard.id} title={dashboard.name} subtitle={dashboard.description}>
            <div className="space-y-4">
              {/* Dashboard Info */}
              {/* <div className="text-sm text-gray-500 space-y-2">
                <div className="flex items-center justify-between">
                  <span>Public:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    dashboard.is_public ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {dashboard.is_public ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Default:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    dashboard.is_default ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {dashboard.is_default ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>Refresh: {dashboard.refresh_interval ? `${dashboard.refresh_interval}s` : 'Manual'}</div>
              </div> */}

              {/* Actions */}
              <div className="flex items-center justify-center pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2">
                  {/* <Button
                    onClick={() => handleDuplicateDashboard(dashboard.id)}
                    variant="outline"
                    size="sm"
                  >
                    <MdControlPointDuplicate className="w-4 h-4 text-gray-500 ml-1" />
                  </Button> */}
                  {!dashboard.is_default && (
                    <Button
                      onClick={() => handleSetDefault(dashboard.id)}
                      variant="outline"
                      size="sm"
                    >
                      Set Default
                    </Button>
                  )}
                  {ROLE_PERMISSIONS[userRole].canEdit && (
                    <Button
                      onClick={() => navigate(`/dashboards/${dashboard.id}/edit`)}
                      variant="success"
                      size="sm"
                    >
                      <MdEdit className="w-4 h-4 text-white" />
                    </Button>
                  )}
                  {ROLE_PERMISSIONS[userRole].canDelete && (
                    <Button
                      onClick={() => handleDeleteDashboard(dashboard.id)}
                      variant="danger"
                      size="sm"
                    >
                      <MdDelete className="w-4 h-4 text-white" />
                    </Button>
                  )}
                <Button variant="primary" size="sm" onClick={() => navigate(`/dashboards/${dashboard.id}`)}>
                  View
                </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {dashboards.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">No dashboards found. Create your first dashboard to get started.</p>
          </div>
        </Card>
      )}

      {/* Create Dashboard Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Dashboard"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dashboard Template
            </label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              <option value="">Select a template</option>
              {getAvailableTemplates().map(template => (
                <option key={template} value={template}>
                  {template.charAt(0).toUpperCase() + template.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {selectedTemplate && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                {getTemplateData(selectedTemplate).name}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {getTemplateData(selectedTemplate).description}
              </p>
              <div className="text-sm text-gray-500">
                <div>Layout: {getTemplateData(selectedTemplate).layout.columns} × {getTemplateData(selectedTemplate).layout.rows}</div>
                <div>Widgets: {getTemplateData(selectedTemplate).widgets.length}</div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={() => setShowCreateModal(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              disabled={!selectedTemplate}
              onClick={() => selectedTemplate && handleCreateDashboard(getTemplateData(selectedTemplate))}
            >
              Create Dashboard
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardsPage;
