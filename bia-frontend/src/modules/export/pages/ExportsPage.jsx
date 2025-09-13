import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getExportJobs,
  getExportStatistics,
  exportData,
  cancelExportJob,
  downloadExport
} from '../../../api/exportsApi';
import { ROLES, ROLE_PERMISSIONS } from '../../../constants/roles';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import KPIWidget from '../../../components/charts/KPIWidget';
import ExportCard from '../components/ExportCard';
import ExportFilters from '../components/ExportFilters';

import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdContentCopy, 
  MdDownload,
  MdFilterList,
  MdViewList,
  MdGridView,
  MdRefresh
} from 'react-icons/md';

const ExportsPage = () => {
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    format: '',
    status: '',
    dateRange: '',
    source: ''
  });
  const [userRole, setUserRole] = useState(ROLES.ADMIN); // Mock user role
  const navigate = useNavigate();

  useEffect(() => {
    fetchExports();
    fetchExportStats();
  }, []);

  const fetchExports = async () => {
    try {
      setLoading(true);
      const res = await getExportJobs();
      setExports(res.data || []);
    } catch (error) {
      console.error('Error fetching exports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExportStats = async () => {
    try {
      const data = await getExportStatistics();
      setStats(data || {});
    } catch (error) {
      console.error('Error fetching export stats:', error);
    }
  };

  const handleCreateExport = async (exportData) => {
    try {
      await exportData(exportData.data, exportData.format, exportData.filename);
      setShowCreateModal(false);
      fetchExports();
      fetchExportStats();
    } catch (error) {
      console.error('Error creating export:', error);
    }
  };

  const handleDeleteExport = async (exportId) => {
    if (window.confirm('Are you sure you want to delete this export?')) {
      try {
        await cancelExportJob(exportId);
        fetchExports();
        fetchExportStats();
      } catch (error) {
        console.error('Error deleting export:', error);
      }
    }
  };

  const handleDuplicateExport = async (exportId) => {
    try {
      // Duplicate export functionality would go here
      console.log('Duplicate export:', exportId);
      fetchExports();
      fetchExportStats();
    } catch (error) {
      console.error('Error duplicating export:', error);
    }
  };

  const handleDownloadExport = async (exportId) => {
    try {
      await downloadExport(exportId);
    } catch (error) {
      console.error('Error downloading export:', error);
    }
  };

  const filteredExports = exports.filter(exportItem => {
    if (filters.format && exportItem.format !== filters.format) return false;
    if (filters.status && exportItem.status !== filters.status) return false;
    if (filters.source && exportItem.source !== filters.source) return false;
    return true;
  });

  const getRoleBasedExports = () => {
    const roleExports = {
      [ROLES.ADMIN]: exports,
      [ROLES.MANAGER]: exports.filter(e => ['dashboard', 'report', 'data'].includes(e.type)),
      [ROLES.ANALYST]: exports.filter(e => ['data', 'analysis', 'custom'].includes(e.type)),
      [ROLES.VIEWER]: exports.filter(e => e.is_public || e.role === userRole),
      [ROLES.SALES]: exports.filter(e => ['sales', 'customer', 'marketing'].includes(e.category)),
      [ROLES.HR]: exports.filter(e => ['hr', 'employee', 'performance'].includes(e.category)),
      [ROLES.FINANCE]: exports.filter(e => ['finance', 'budget', 'revenue'].includes(e.category)),
      [ROLES.OPERATIONS]: exports.filter(e => ['operations', 'supply_chain', 'inventory'].includes(e.category))
    };
    return roleExports[userRole] || exports;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const roleBasedExports = getRoleBasedExports();
  const displayExports = filters.format || filters.status || filters.source ? filteredExports : roleBasedExports;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Exports</h1>
          <p className="text-gray-600">Manage and download data exports</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => setShowFilters(!showFilters)} 
            variant="outline"
            className="flex items-center space-x-2"
          >
            <MdFilterList className="w-4 h-4" />
            <span>Filters</span>
          </Button>
          <div className="flex border border-gray-300 rounded-md">
            <Button
              onClick={() => setViewMode('grid')}
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              className="rounded-r-none"
            >
              <MdGridView className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              className="rounded-l-none"
            >
              <MdViewList className="w-4 h-4" />
            </Button>
          </div>
          {ROLE_PERMISSIONS[userRole].canCreate && (
            <Button onClick={() => setShowCreateModal(true)} variant="primary">
              <MdAdd className="w-4 h-4 mr-2" />
              Create Export
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <ExportFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIWidget
          title="Total Exports"
          value={displayExports.length || 0}
          icon={
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <KPIWidget
          title="Completed"
          value={displayExports.filter(exportItem => exportItem.status === 'completed').length || 0}
          icon={
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPIWidget
          title="In Progress"
          value={displayExports.filter(exportItem => exportItem.status === 'processing').length || 0}
          icon={
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPIWidget
          title="This Month"
          value={displayExports.filter(exportItem => {
            const exportDate = new Date(exportItem.created_at);
            const now = new Date();
            return exportDate.getMonth() === now.getMonth() && exportDate.getFullYear() === now.getFullYear();
          }).length || 0}
          icon={
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Exports Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayExports.map(exportItem => (
            <ExportCard
              key={exportItem.id}
              exportItem={exportItem}
              onEdit={() => navigate(`/exports/${exportItem.id}/edit`)}
              onView={() => navigate(`/exports/${exportItem.id}`)}
              onDelete={() => handleDeleteExport(exportItem.id)}
              onDuplicate={() => handleDuplicateExport(exportItem.id)}
              onDownload={() => handleDownloadExport(exportItem.id)}
              userRole={userRole}
            />
          ))}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Export
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Format
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayExports.map(exportItem => (
                  <tr key={exportItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{exportItem.name}</div>
                        <div className="text-sm text-gray-500">{exportItem.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {exportItem.format?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        exportItem.status === 'completed' ? 'bg-green-100 text-green-800' :
                        exportItem.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        exportItem.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {exportItem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exportItem.file_size ? `${(exportItem.file_size / 1024 / 1024).toFixed(2)} MB` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(exportItem.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => navigate(`/exports/${exportItem.id}`)}
                          variant="outline"
                          size="sm"
                        >
                          View
                        </Button>
                        {exportItem.status === 'completed' && (
                          <Button
                            onClick={() => handleDownloadExport(exportItem.id)}
                            variant="outline"
                            size="sm"
                          >
                            <MdDownload className="w-4 h-4" />
                          </Button>
                        )}
                        {ROLE_PERMISSIONS[userRole].canDelete && (
                          <Button
                            onClick={() => handleDeleteExport(exportItem.id)}
                            variant="outline"
                            size="sm"
                          >
                            <MdDelete className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {displayExports.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">No exports found. Create your first export to get started.</p>
          </div>
        </Card>
      )}

      {/* Create Export Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Export"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Type
            </label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select export type</option>
              <option value="dashboard">Dashboard Export</option>
              <option value="report">Report Export</option>
              <option value="data">Data Export</option>
              <option value="custom">Custom Export</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={() => setShowCreateModal(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              onClick={() => navigate('/exports/new')}
            >
              Continue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExportsPage;
