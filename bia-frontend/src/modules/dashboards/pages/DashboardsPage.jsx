import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllDashboards,
  getDashboardStats,
  createDashboard,
  duplicateDashboard,
  deleteDashboard,
  setDefaultDashboard,
  shareDashboard,
  getDashboardAnalytics
} from '../../../api/dashboardsApi';
import { DASHBOARD_TEMPLATES } from '../../../constants/chartConfig';
import { ROLE_DASHBOARDS, ROLES, ROLE_PERMISSIONS } from '../../../constants/roles';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import KPIWidget from '../../../components/charts/KPIWidget';
import LineChart from '../../../components/charts/LineChart';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';
import SearchInput from '../../../components/ui/SearchInput';
import FilterDropdown from '../../../components/ui/FilterDropdown';
import ToggleSwitch from '../../../components/ui/ToggleSwitch';
import Badge from '../../../components/ui/Badge';
import Tooltip from '../../../components/ui/Tooltip';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import EmptyState from '../../../components/ui/EmptyState';

import { 
  MdEdit, 
  MdDelete, 
  MdControlPointDuplicate, 
  MdShare, 
  MdStar, 
  MdStarBorder,
  MdRefresh,
  MdViewModule,
  MdViewList,
  MdFilterList,
  MdSearch,
  MdAnalytics,
  MdTrendingUp,
  MdPublic,
  MdLock,
  MdSchedule,
  MdMoreVert
} from 'react-icons/md';
const DashboardsPage = () => {
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [userRole, setUserRole] = useState(ROLES.ADMIN); // Mock user role
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    fetchDashboards();
    fetchDashboardStats();
    fetchDashboardAnalytics();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing) {
        fetchDashboards();
        fetchDashboardStats();
      }
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshing]);

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

  const fetchDashboardStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data || {});
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchDashboardAnalytics = async () => {
    try {
      const data = await getDashboardAnalytics();
      setAnalytics(data || {});
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchDashboards(),
        fetchDashboardStats(),
        fetchDashboardAnalytics()
      ]);
    } finally {
      setRefreshing(false);
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

  // Filter and sort dashboards
  const filteredAndSortedDashboards = useMemo(() => {
    let filtered = dashboards.filter(dashboard => {
      const matchesSearch = dashboard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dashboard.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || dashboard.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && dashboard.is_active) ||
                           (filterStatus === 'inactive' && !dashboard.is_active) ||
                           (filterStatus === 'public' && dashboard.is_public) ||
                           (filterStatus === 'private' && !dashboard.is_public);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort dashboards
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'updated_at' || sortBy === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [dashboards, searchTerm, filterCategory, filterStatus, sortBy, sortOrder]);

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
    return <LoadingSpinner size="large" message="Loading dashboards..." />;
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
              <MdAnalytics className="text-blue-600" />
              Dashboards
            </h1>
            <p className="text-gray-600 mt-1">
              Create and manage your business intelligence dashboards
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MdTrendingUp className="text-green-500" />
                {analytics.performance_trend || '0%'} performance improvement
              </span>
              <span className="flex items-center gap-1">
                <MdSchedule className="text-blue-500" />
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
          <div className="flex space-x-3">
            <Tooltip content="Refresh all dashboards">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                disabled={refreshing}
              >
                <MdRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </Tooltip>
            <Button onClick={() => setShowCreateModal(true)} variant="primary">
              <MdViewModule className="w-4 h-4 mr-2" />
              Create from Template
            </Button>
            <Button onClick={() => navigate(`/dashboards/new`)} variant="success">
              New Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIWidget
          title="Total Dashboards"
          value={dashboards.length || 0}
          change={analytics.total_dashboards_change || 0}
          icon={<MdViewModule className="w-5 h-5 text-blue-600" />}
          trend="up"
        />
        <KPIWidget
          title="Active Dashboards"
          value={dashboards.filter(dashboard => dashboard.is_active).length || 0}
          change={analytics.active_dashboards_change || 0}
          icon={<MdTrendingUp className="w-5 h-5 text-green-600" />}
          trend="up"
        />
        <KPIWidget
          title="Public Dashboards"
          value={dashboards.filter(dashboard => dashboard.is_public).length || 0}
          change={analytics.public_dashboards_change || 0}
          icon={<MdPublic className="w-5 h-5 text-purple-600" />}
          trend="up"
        />
        <KPIWidget
          title="Total Views"
          value={analytics.total_views || 0}
          change={analytics.views_change || 0}
          icon={<MdAnalytics className="w-5 h-5 text-orange-600" />}
          trend="up"
        />
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1 max-w-md">
              <SearchInput
                placeholder="Search dashboards..."
                value={searchTerm}
                onChange={setSearchTerm}
                icon={<MdSearch className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-2">
              <FilterDropdown
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'sales', label: 'Sales' },
                  { value: 'finance', label: 'Finance' },
                  { value: 'hr', label: 'Human Resources' },
                  { value: 'operations', label: 'Operations' },
                  { value: 'analytics', label: 'Analytics' }
                ]}
                value={filterCategory}
                onChange={setFilterCategory}
                icon={<MdFilterList className="w-4 h-4" />}
              />
              <FilterDropdown
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'public', label: 'Public' },
                  { value: 'private', label: 'Private' }
                ]}
                value={filterStatus}
                onChange={setFilterStatus}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">View:</span>
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <MdViewModule className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <MdViewList className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <MdFilterList className="w-4 h-4 mr-1" />
              Filters
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="updated_at">Last Updated</option>
                  <option value="created_at">Created Date</option>
                  <option value="name">Name</option>
                  <option value="category">Category</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('all');
                    setFilterStatus('all');
                    setSortBy('updated_at');
                    setSortOrder('desc');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Enhanced Dashboards Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredAndSortedDashboards.map(dashboard => (
            <Card key={dashboard.id} className="hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                {/* Dashboard Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{dashboard.name}</h3>
                      {dashboard.is_default && (
                        <Badge variant="gold" icon={<MdStar className="w-3 h-3" />}>
                          Default
                        </Badge>
                      )}
                      {dashboard.is_public ? (
                        <Badge variant="green" icon={<MdPublic className="w-3 h-3" />}>
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="gray" icon={<MdLock className="w-3 h-3" />}>
                          Private
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{dashboard.description || 'No description'}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Category: {dashboard.category || 'Uncategorized'}</span>
                      <span>•</span>
                      <span>Updated: {new Date(dashboard.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip content="More options">
                      <Button variant="ghost" size="sm">
                        <MdMoreVert className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>

                {/* Dashboard Preview/Stats */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {dashboard.kpi?.length || 0}
                      </div>
                      <div className="text-xs text-gray-600">KPIs</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {dashboard.view_count || 0}
                      </div>
                      <div className="text-xs text-gray-600">Views</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    {ROLE_PERMISSIONS[userRole].canEdit && (
                      <Tooltip content="Edit Dashboard">
                        <Button
                          onClick={() => navigate(`/dashboards/${dashboard.id}/edit`)}
                          variant="outline"
                          size="sm"
                        >
                          <MdEdit className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    )}
                    <Tooltip content="Share Dashboard">
                      <Button
                        onClick={() => {
                          setSelectedDashboard(dashboard);
                          setShowShareModal(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <MdShare className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                    {!dashboard.is_default && (
                      <Tooltip content="Set as Default">
                        <Button
                          onClick={() => handleSetDefault(dashboard.id)}
                          variant="outline"
                          size="sm"
                        >
                          <MdStarBorder className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => navigate(`/dashboards/${dashboard.id}`)}
                  >
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedDashboards.map(dashboard => (
            <Card key={dashboard.id} className="hover:shadow-md transition-shadow duration-200">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MdViewModule className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{dashboard.name}</h3>
                        {dashboard.is_default && (
                          <Badge variant="gold" icon={<MdStar className="w-3 h-3" />}>
                            Default
                          </Badge>
                        )}
                        {dashboard.is_public ? (
                          <Badge variant="green" icon={<MdPublic className="w-3 h-3" />}>
                            Public
                          </Badge>
                        ) : (
                          <Badge variant="gray" icon={<MdLock className="w-3 h-3" />}>
                            Private
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{dashboard.description || 'No description'}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Category: {dashboard.category || 'Uncategorized'}</span>
                        <span>•</span>
                        <span>{dashboard.widget_count || 0} widgets</span>
                        <span>•</span>
                        <span>{dashboard.view_count || 0} views</span>
                        <span>•</span>
                        <span>Updated: {new Date(dashboard.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {ROLE_PERMISSIONS[userRole].canEdit && (
                      <Button
                        onClick={() => navigate(`/dashboards/${dashboard.id}/edit`)}
                        variant="outline"
                        size="sm"
                      >
                        <MdEdit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        setSelectedDashboard(dashboard);
                        setShowShareModal(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <MdShare className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => navigate(`/dashboards/${dashboard.id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedDashboards.length === 0 && (
        <EmptyState
          icon={<MdViewModule className="w-16 h-16 text-gray-400" />}
          title="No dashboards found"
          description={
            searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
              ? "Try adjusting your search or filter criteria"
              : "Create your first dashboard to get started with business intelligence"
          }
          action={
            <Button onClick={() => setShowCreateModal(true)} variant="primary">
              Create Dashboard
            </Button>
          }
        />
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

      {/* Share Dashboard Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Dashboard"
        size="md"
      >
        {selectedDashboard && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{selectedDashboard.name}</h4>
              <p className="text-sm text-gray-600">{selectedDashboard.description}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="shareType"
                      value="public"
                      className="mr-2"
                      defaultChecked={selectedDashboard.is_public}
                    />
                    <span className="text-sm">Public - Anyone with the link can view</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="shareType"
                      value="private"
                      className="mr-2"
                      defaultChecked={!selectedDashboard.is_public}
                    />
                    <span className="text-sm">Private - Only invited users can view</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={`${window.location.origin}/dashboards/${selectedDashboard.id}`}
                    readOnly
                    className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/dashboards/${selectedDashboard.id}`)}
                    className="rounded-l-none"
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">Allow downloading</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Require password</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                onClick={() => setShowShareModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button 
                variant="primary"
                onClick={() => {
                  // Handle share logic
                  setShowShareModal(false);
                }}
              >
                Update Sharing
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DashboardsPage;
