import React from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

import { MdDownload, MdRefresh, MdFullscreen } from 'react-icons/md';

const ExportPreview = ({ data, onRefresh, onExport }) => {
  if (!data || !data.columns || !data.rows) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500">No data available for preview</p>
        </div>
      </Card>
    );
  }

  const handleExport = (format) => {
    if (onExport) {
      onExport(format);
      return;
    }

    // Default export functionality
    const csvContent = [
      data.columns.join(','),
      ...data.rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
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

  return (
    <Card>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Export Preview</h3>
            <p className="text-sm text-gray-600">
              {data.rows.length} rows • Format: {data.format?.toUpperCase()} • Generated {new Date().toLocaleString()}
            </p>
          </div>
          <div className="flex space-x-2">
            {onRefresh && (
              <Button onClick={onRefresh} variant="outline" size="sm">
                <MdRefresh className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            )}
            <div className="relative">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <MdDownload className="w-4 h-4" />
                <span>Export</span>
              </Button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('csv')}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <span className="mr-2">📊</span>
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <span className="mr-2">📈</span>
                    Export as Excel
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <span className="mr-2">📄</span>
                    Export as PDF
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <span className="mr-2">🔧</span>
                    Export as JSON
                  </button>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <MdFullscreen className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Format Info */}
        <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
          <span className="text-2xl">{getFormatIcon(data.format)}</span>
          <div>
            <div className="font-medium text-blue-900">{data.format?.toUpperCase()} Format</div>
            <div className="text-sm text-blue-700">
              {data.totalRows ? `${data.totalRows} total rows` : `${data.rows.length} rows shown`}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {data.columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data.pagination && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {data.pagination.start} to {data.pagination.end} of {data.pagination.total} results
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!data.pagination.hasPrevious}
                onClick={() => data.pagination.onPrevious?.()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!data.pagination.hasNext}
                onClick={() => data.pagination.onNext?.()}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {data.summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            {data.summary.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Export Settings */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Export Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Format:</span>
              <span className="ml-2 font-medium">{data.format?.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-gray-600">Rows:</span>
              <span className="ml-2 font-medium">{data.rows.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Columns:</span>
              <span className="ml-2 font-medium">{data.columns.length}</span>
            </div>
            <div>
              <span className="text-gray-600">File Size:</span>
              <span className="ml-2 font-medium">
                {data.fileSize ? `${(data.fileSize / 1024).toFixed(2)} KB` : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Filters Applied */}
        {data.filters && data.filters.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Applied Filters</h4>
            <div className="flex flex-wrap gap-2">
              {data.filters.map((filter, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {filter.field}: {filter.value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Data Quality Warnings */}
        {data.warnings && data.warnings.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-yellow-900 mb-2">Data Quality Warnings</h4>
            <div className="space-y-1">
              {data.warnings.map((warning, index) => (
                <div key={index} className="text-sm text-yellow-800 bg-yellow-50 p-2 rounded">
                  ⚠️ {warning}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ExportPreview;
