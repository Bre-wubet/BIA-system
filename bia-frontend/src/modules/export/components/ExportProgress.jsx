import React from 'react';
import Button from '../../../components/ui/Button';

import { MdRefresh, MdCancel, MdCheckCircle, MdError } from 'react-icons/md';

const ExportProgress = ({ progress, status, message, onCancel, onRetry }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <MdCheckCircle className="w-6 h-6 text-green-600" />;
      case 'failed':
        return <MdError className="w-6 h-6 text-red-600" />;
      case 'processing':
        return (
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <div className="w-6 h-6 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'processing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Export completed successfully';
      case 'failed': return 'Export failed';
      case 'processing': return 'Export in progress';
      case 'pending': return 'Export pending';
      default: return 'Unknown status';
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon(status)}
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {getStatusText(status)}
            </h3>
            {message && (
              <p className={`text-sm ${getStatusColor(status)}`}>
                {message}
              </p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {status === 'failed' && onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <MdRefresh className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
          {status === 'processing' && onCancel && (
            <Button onClick={onCancel} variant="outline" size="sm">
              <MdCancel className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {status === 'processing' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-semibold text-gray-900">{progress}%</div>
          <div className="text-sm text-gray-600">Progress</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className={`text-2xl font-semibold ${getStatusColor(status)}`}>
            {status === 'completed' ? '✓' : status === 'failed' ? '✗' : '⏳'}
          </div>
          <div className="text-sm text-gray-600">Status</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-semibold text-gray-900">
            {new Date().toLocaleTimeString()}
          </div>
          <div className="text-sm text-gray-600">Last Update</div>
        </div>
      </div>

      {/* Processing Steps */}
      {status === 'processing' && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Processing Steps</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${
                progress >= 20 ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <span className={`text-sm ${
                progress >= 20 ? 'text-green-700' : 'text-gray-500'
              }`}>
                Validating query and parameters
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${
                progress >= 40 ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <span className={`text-sm ${
                progress >= 40 ? 'text-green-700' : 'text-gray-500'
              }`}>
                Executing data query
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${
                progress >= 70 ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <span className={`text-sm ${
                progress >= 70 ? 'text-green-700' : 'text-gray-500'
              }`}>
                Formatting data for export
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${
                progress >= 90 ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <span className={`text-sm ${
                progress >= 90 ? 'text-green-700' : 'text-gray-500'
              }`}>
                Generating export file
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${
                progress >= 100 ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <span className={`text-sm ${
                progress >= 100 ? 'text-green-700' : 'text-gray-500'
              }`}>
                Finalizing and preparing download
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Details */}
      {status === 'failed' && message && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">Error Details</h4>
          <p className="text-sm text-red-800">{message}</p>
        </div>
      )}

      {/* Success Details */}
      {status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Export Completed</h4>
          <p className="text-sm text-green-800">
            Your export has been generated successfully and is ready for download.
          </p>
        </div>
      )}

      {/* Estimated Time */}
      {status === 'processing' && progress > 0 && (
        <div className="text-center text-sm text-gray-600">
          <div>Estimated time remaining: {Math.max(0, Math.round((100 - progress) / 10))} minutes</div>
        </div>
      )}
    </div>
  );
};

export default ExportProgress;
