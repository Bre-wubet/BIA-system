import React from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { ROLE_PERMISSIONS } from '../../../constants/roles';

import { 
  MdEdit, 
  MdDelete, 
  MdContentCopy, 
  MdDownload, 
  MdSchedule,
  MdRefresh
} from 'react-icons/md';

const ExportCard = ({ 
  exportItem, 
  onEdit, 
  onView, 
  onDelete, 
  onDuplicate, 
  onDownload,
  userRole 
}) => {
  const canEdit = ROLE_PERMISSIONS[userRole]?.canEdit;
  const canDelete = ROLE_PERMISSIONS[userRole]?.canDelete;
  const canExport = ROLE_PERMISSIONS[userRole]?.canExport;

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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {exportItem.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {exportItem.description}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-2xl">{getFormatIcon(exportItem.format)}</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(exportItem.status)}`}>
              {exportItem.status}
            </span>
          </div>
        </div>

        {/* Category and Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(exportItem.category)}`}>
              {exportItem.category}
            </span>
            <span className="text-xs text-gray-500">
              {exportItem.is_scheduled ? 'Scheduled' : 'Manual'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Last run: {exportItem.last_run ? new Date(exportItem.last_run).toLocaleDateString() : 'Never'}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {exportItem.run_count || 0}
            </div>
            <div className="text-xs text-gray-500">Runs</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {exportItem.file_size ? `${(exportItem.file_size / 1024 / 1024).toFixed(1)}MB` : '-'}
            </div>
            <div className="text-xs text-gray-500">Size</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Button
              onClick={onView}
              variant="primary"
              size="sm"
            >
              View
            </Button>
            {canEdit && (
              <Button
                onClick={onEdit}
                variant="outline"
                size="sm"
              >
                <MdEdit className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {exportItem.status === 'completed' && canExport && (
              <Button
                onClick={onDownload}
                variant="outline"
                size="sm"
                title="Download"
              >
                <MdDownload className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={onDuplicate}
              variant="outline"
              size="sm"
              title="Duplicate"
            >
              <MdContentCopy className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => {/* Handle schedule */}}
              variant="outline"
              size="sm"
              title="Schedule"
            >
              <MdSchedule className="w-4 h-4" />
            </Button>
            {canDelete && (
              <Button
                onClick={onDelete}
                variant="outline"
                size="sm"
                title="Delete"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <MdDelete className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar for Processing */}
        {exportItem.status === 'processing' && exportItem.progress !== undefined && (
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Processing...</span>
              <span>{exportItem.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${exportItem.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Message for Failed */}
        {exportItem.status === 'failed' && exportItem.error_message && (
          <div className="pt-2">
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              Error: {exportItem.error_message}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ExportCard;
