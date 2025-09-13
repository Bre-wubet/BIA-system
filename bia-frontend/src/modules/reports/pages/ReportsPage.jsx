import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllReports,
  getReportStats,
  createReport,
  deleteReport,
  duplicateReport,
  scheduleReport
} from '../../../api/reportsApi';
import { ROLES, ROLE_PERMISSIONS } from '../../../constants/roles';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import KPIWidget from '../../../components/charts/KPIWidget';
import ReportCard from '../components/ReportCard';
import ReportFilters from '../components/ReportFilters';

import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdContentCopy, 
  MdSchedule,
  MdDownload,
  MdShare,
  MdFilterList,
  MdViewList,
  MdGridView
} from 'react-icons/md';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    dateRange: '',
    role: ''
  });
  const [userRole, setUserRole] = useState(ROLES.ADMIN); // Mock user role
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
    fetchReportStats();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getAllReports();
      setReports(res.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportStats = async () => {
    try {
      const data = await getReportStats();
      setStats(data || {});
    } catch (error) {
      console.error('Error fetching report stats:', error);
    }
  };

  const handleCreateReport = async (reportData) => {
    try {
      await createReport(reportData);
      setShowCreateModal(false);
      fetchReports();
      fetchReportStats();
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteReport(reportId);
        fetchReports();
        fetchReportStats();
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const handleDuplicateReport = async (reportId) => {
    try {
      await duplicateReport(reportId);
      fetchReports();
      fetchReportStats();
    } catch (error) {
      console.error('Error duplicating report:', error);
    }
  };

  const handleScheduleReport = async (reportId, scheduleData) => {
    try {
      await scheduleReport(reportId, scheduleData);
      fetchReports();
    } catch (error) {
      console.error('Error scheduling report:', error);
    }
  };

  const filteredReports = reports.filter(report => {
    if (filters.category && report.category !== filters.category) return false;
    if (filters.status && report.status !== filters.status) return false;
    if (filters.role && report.role !== filters.role) return false;
    return true;
  });

  const getRoleBasedReports = () => {
    const roleReports = {
      [ROLES.ADMIN]: reports,
      [ROLES.MANAGER]: reports.filter(r => ['executive', 'management', 'sales', 'hr', 'finance', 'operations'].includes(r.category)),
      [ROLES.ANALYST]: reports.filter(r => ['analytics', 'data_analysis', 'custom'].includes(r.category)),
      [ROLES.VIEWER]: reports.filter(r => r.is_public || r.role === userRole),
      [ROLES.SALES]: reports.filter(r => ['sales', 'marketing', 'customer'].includes(r.category)),
      [ROLES.HR]: reports.filter(r => ['hr', 'employee', 'performance'].includes(r.category)),
      [ROLES.FINANCE]: reports.filter(r => ['finance', 'budget', 'revenue'].includes(r.category)),
      [ROLES.OPERATIONS]: reports.filter(r => ['operations', 'supply_chain', 'inventory'].includes(r.category))
    };
    return roleReports[userRole] || reports;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const roleBasedReports = getRoleBasedReports();
  const displayReports = filters.category || filters.status || filters.role ? filteredReports : roleBasedReports;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Reports</h1>
          <p className="text-gray-600">Create, manage, and schedule business reports</p>
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
              Create Report
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <ReportFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIWidget
          title="Total Reports"
          value={displayReports.length || 0}
          icon={
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <KPIWidget
          title="Scheduled Reports"
          value={displayReports.filter(report => report.is_scheduled).length || 0}
          icon={
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPIWidget
          title="Public Reports"
          value={displayReports.filter(report => report.is_public).length || 0}
          icon={
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />
        <KPIWidget
          title="This Month"
          value={displayReports.filter(report => {
            const reportDate = new Date(report.created_at);
            const now = new Date();
            return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
          }).length || 0}
          icon={
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Reports Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayReports.map(report => (
            <ReportCard
              key={report.id}
              report={report}
              onEdit={() => navigate(`/reports/${report.id}/edit`)}
              onView={() => navigate(`/reports/${report.id}`)}
              onDelete={() => handleDeleteReport(report.id)}
              onDuplicate={() => handleDuplicateReport(report.id)}
              onSchedule={(scheduleData) => handleScheduleReport(report.id, scheduleData)}
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
                    Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Run
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayReports.map(report => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.name}</div>
                        <div className="text-sm text-gray-500">{report.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {report.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        report.status === 'active' ? 'bg-green-100 text-green-800' :
                        report.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.last_run ? new Date(report.last_run).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => navigate(`/reports/${report.id}`)}
                          variant="outline"
                          size="sm"
                        >
                          View
                        </Button>
                        {ROLE_PERMISSIONS[userRole].canEdit && (
                          <Button
                            onClick={() => navigate(`/reports/${report.id}/edit`)}
                            variant="outline"
                            size="sm"
                          >
                            <MdEdit className="w-4 h-4" />
                          </Button>
                        )}
                        {ROLE_PERMISSIONS[userRole].canDelete && (
                          <Button
                            onClick={() => handleDeleteReport(report.id)}
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

      {displayReports.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">No reports found. Create your first report to get started.</p>
          </div>
        </Card>
      )}

      {/* Create Report Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Report"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select report type</option>
              <option value="financial">Financial Report</option>
              <option value="sales">Sales Report</option>
              <option value="hr">HR Report</option>
              <option value="operations">Operations Report</option>
              <option value="custom">Custom Report</option>
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
              onClick={() => navigate('/reports/new')}
            >
              Continue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReportsPage;
