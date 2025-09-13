import React from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { ROLE_PERMISSIONS } from '../../../constants/roles';

import { 
  MdEdit, 
  MdDelete, 
  MdContentCopy, 
  MdSchedule, 
  MdDownload, 
  MdShare,
  MdMoreVert
} from 'react-icons/md';

const ReportCard = ({ 
  report, 
  onEdit, 
  onView, 
  onDelete, 
  onDuplicate, 
  onSchedule,
  userRole 
}) => {
  const canEdit = ROLE_PERMISSIONS[userRole]?.canEdit;
  const canDelete = ROLE_PERMISSIONS[userRole]?.canDelete;
  const canExport = ROLE_PERMISSIONS[userRole]?.canExport;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
              {report.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {report.description}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
              {report.status}
            </span>
            {report.is_public && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                Public
              </span>
            )}
          </div>
        </div>

        {/* Category and Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(report.category)}`}>
              {report.category}
            </span>
            <span className="text-xs text-gray-500">
              {report.is_scheduled ? 'Scheduled' : 'Manual'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Last run: {report.last_run ? new Date(report.last_run).toLocaleDateString() : 'Never'}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {report.run_count || 0}
            </div>
            <div className="text-xs text-gray-500">Runs</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {report.view_count || 0}
            </div>
            <div className="text-xs text-gray-500">Views</div>
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
            {canExport && (
              <Button
                onClick={() => {/* Handle export */}}
                variant="outline"
                size="sm"
                title="Export"
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
              onClick={onSchedule}
              variant="outline"
              size="sm"
              title="Schedule"
            >
              <MdSchedule className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => {/* Handle share */}}
              variant="outline"
              size="sm"
              title="Share"
            >
              <MdShare className="w-4 h-4" />
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
      </div>
    </Card>
  );
};

export default ReportCard;
