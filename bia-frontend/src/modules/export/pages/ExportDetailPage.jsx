import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExportJob, downloadExport, exportData } from '../../../api/exportsApi';
import { ROLES, ROLE_PERMISSIONS } from '../../../constants/roles';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import ExportPreview from '../components/ExportPreview';
import ExportScheduler from '../components/ExportScheduler';
import ExportProgress from '../components/ExportProgress';

import { 
  MdEdit, 
  MdDelete, 
  MdDownload, 
  MdRefresh,
  MdContentCopy,
  MdSchedule,
  MdArrowBack,
  MdFileDownload
} from 'react-icons/md';

const ExportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exportItem, setExportItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [exportData, setExportData] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [userRole, setUserRole] = useState(ROLES.ADMIN);

  useEffect(() => {
    fetchExport();
  }, [id]);

  const fetchExport = async () => {
    try {
      setLoading(true);
      const res = await getExportJob(id);
      setExportItem(res.data);
    } catch (error) {
      console.error('Error fetching export:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunExport = async () => {
    try {
      setRunning(true);
      const res = await exportData({}, 'csv', `export_${id}.csv`);
      setExportData(res.data);
      // Refresh export details to get updated status
      fetchExport();
    } catch (error) {
      console.error('Error running export:', error);
    } finally {
      setRunning(false);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadExport(id);
    } catch (error) {
      console.error('Error downloading export:', error);
    }
  };

  const handleSchedule = async (scheduleData) => {
    try {
      // Schedule export functionality would go here
      console.log('Schedule export:', id, scheduleData);
      setShowScheduleModal(false);
      fetchExport();
    } catch (error) {
      console.error('Error scheduling export:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!exportItem) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Export not found</p>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-blue-900">{exportItem.name}</h1>
            <p className="text-gray-600">{exportItem.description}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleRunExport} variant="primary" loading={running}>
            <MdRefresh className="w-4 h-4 mr-2" />
            Run Export
          </Button>
          {exportItem.status === 'completed' && (
            <Button onClick={handleDownload} variant="outline">
              <MdDownload className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
          {ROLE_PERMISSIONS[userRole].canEdit && (
            <Button
              onClick={() => navigate(`/exports/${id}/edit`)}
              variant="outline"
            >
              <MdEdit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Export Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Format</h3>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getFormatIcon(exportItem.format)}</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {exportItem.format?.toUpperCase()}
              </span>
            </div>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Status</h3>
            <span className={`px-2 py-1 text-sm rounded-full ${getStatusColor(exportItem.status)}`}>
              {exportItem.status}
            </span>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">File Size</h3>
            <p className="text-sm text-gray-600">
              {exportItem.file_size ? `${(exportItem.file_size / 1024 / 1024).toFixed(2)} MB` : '-'}
            </p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Last Run</h3>
            <p className="text-sm text-gray-600">
              {exportItem.last_run ? new Date(exportItem.last_run).toLocaleString() : 'Never'}
            </p>
          </div>
        </Card>
      </div>

      {/* Progress */}
      {exportItem.status === 'processing' && (
        <Card>
          <ExportProgress 
            progress={exportItem.progress || 0}
            status={exportItem.status}
            message={exportItem.message}
          />
        </Card>
      )}

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
              onClick={() => navigate(`/exports/new?template=${id}`)}
              variant="outline"
            >
              <MdContentCopy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            {exportItem.status === 'completed' && (
              <Button
                onClick={handleDownload}
                variant="outline"
              >
                <MdFileDownload className="w-4 h-4 mr-2" />
                Download File
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Export Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card>
          <h3 className="text-lg font-medium mb-4">Configuration</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-700">Type:</span>
              <span className="ml-2 text-sm text-gray-900">{exportItem.type}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Data Source:</span>
              <span className="ml-2 text-sm text-gray-900">{exportItem.data_source}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Created:</span>
              <span className="ml-2 text-sm text-gray-900">
                {new Date(exportItem.created_at).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Public:</span>
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                exportItem.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {exportItem.is_public ? 'Yes' : 'No'}
              </span>
            </div>
            {exportItem.is_scheduled && (
              <div>
                <span className="text-sm font-medium text-gray-700">Scheduled:</span>
                <span className="ml-2 text-sm text-gray-900">
                  {exportItem.schedule_config?.frequency || 'Unknown'}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Query */}
        <Card>
          <h3 className="text-lg font-medium mb-4">Query</h3>
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
              {exportItem.query || 'No query specified'}
            </pre>
          </div>
        </Card>
      </div>

      {/* Export Data */}
      {exportData ? (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Export Data</h3>
            <div className="text-sm text-gray-500">
              Generated on {new Date().toLocaleString()}
            </div>
          </div>
          <ExportPreview data={exportData} />
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No data available. Run the export to see results.</p>
            <Button onClick={handleRunExport} variant="primary" loading={running}>
              <MdRefresh className="w-4 h-4 mr-2" />
              Run Export
            </Button>
          </div>
        </Card>
      )}

      {/* Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Export"
        size="md"
      >
        <ExportScheduler
          exportItem={exportItem}
          onSchedule={handleSchedule}
          onCancel={() => setShowScheduleModal(false)}
        />
      </Modal>
    </div>
  );
};

export default ExportDetailPage;
