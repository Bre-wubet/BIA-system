import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReportById, runReport, scheduleReport, shareReport } from '../../../api/reportsApi';
import { ROLES, ROLE_PERMISSIONS } from '../../../constants/roles';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import ReportPreview from '../components/ReportPreview';
import ReportScheduler from '../components/ReportScheduler';
import ReportSharing from '../components/ReportSharing';

import { 
  MdEdit, 
  MdDelete, 
  MdShare, 
  MdSchedule, 
  MdDownload, 
  MdRefresh,
  MdContentCopy,
  MdSettings,
  MdArrowBack
} from 'react-icons/md';

const ReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [userRole, setUserRole] = useState(ROLES.ADMIN);

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

  const handleRunReport = async () => {
    try {
      setRunning(true);
      const res = await runReport(id);
      setReportData(res.data);
    } catch (error) {
      console.error('Error running report:', error);
    } finally {
      setRunning(false);
    }
  };

  const handleSchedule = async (scheduleData) => {
    try {
      await scheduleReport(id, scheduleData);
      setShowScheduleModal(false);
      fetchReport();
    } catch (error) {
      console.error('Error scheduling report:', error);
    }
  };

  const handleShare = async (shareData) => {
    try {
      await shareReport(id, shareData);
      setShowShareModal(false);
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };

  const handleExport = (format) => {
    // Mock export functionality
    const data = reportData || { columns: [], rows: [] };
    const csvContent = [
      data.columns.join(','),
      ...data.rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report?.name || 'report'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
            onClick={() => navigate('/reports')}
            variant="outline"
            size="sm"
          >
            <MdArrowBack className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-blue-900">{report.name}</h1>
            <p className="text-gray-600">{report.description}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleRunReport} variant="primary" loading={running}>
            <MdRefresh className="w-4 h-4 mr-2" />
            Run Report
          </Button>
          <div className="relative">
            <Button variant="outline" className="flex items-center space-x-2">
              <MdDownload className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
              <div className="py-1">
                <button
                  onClick={() => handleExport('csv')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export as PDF
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Export as Excel
                </button>
              </div>
            </div>
          </div>
          {ROLE_PERMISSIONS[userRole].canEdit && (
            <Button
              onClick={() => navigate(`/reports/${id}/edit`)}
              variant="outline"
            >
              <MdEdit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Report Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Category</h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {report.category}
            </span>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Status</h3>
            <span className={`px-2 py-1 text-sm rounded-full ${
              report.status === 'active' ? 'bg-green-100 text-green-800' :
              report.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {report.status}
            </span>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Last Run</h3>
            <p className="text-sm text-gray-600">
              {report.last_run ? new Date(report.last_run).toLocaleString() : 'Never'}
            </p>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Actions</h3>
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowScheduleModal(true)}
              variant="outline"
            >
              <MdSchedule className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <Button
              onClick={() => setShowShareModal(true)}
              variant="outline"
            >
              <MdShare className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={() => navigate(`/reports/new?template=${id}`)}
              variant="outline"
            >
              <MdContentCopy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Data */}
      {reportData ? (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Report Data</h3>
            <div className="text-sm text-gray-500">
              Generated on {new Date().toLocaleString()}
            </div>
          </div>
          <ReportPreview data={reportData} />
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No data available. Run the report to see results.</p>
            <Button onClick={handleRunReport} variant="primary" loading={running}>
              <MdRefresh className="w-4 h-4 mr-2" />
              Run Report
            </Button>
          </div>
        </Card>
      )}

      {/* Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Report"
        size="md"
      >
        <ReportScheduler
          report={report}
          onSchedule={handleSchedule}
          onCancel={() => setShowScheduleModal(false)}
        />
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Report"
        size="md"
      >
        <ReportSharing
          report={report}
          onShare={handleShare}
          onCancel={() => setShowShareModal(false)}
        />
      </Modal>
    </div>
  );
};

export default ReportDetailPage;
