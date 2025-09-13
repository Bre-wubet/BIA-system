import React from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

import { MdDownload, MdRefresh, MdFullscreen } from 'react-icons/md';

const ReportPreview = ({ data, onRefresh, onExport }) => {
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
    a.download = `report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Report Preview</h3>
            <p className="text-sm text-gray-600">
              {data.rows.length} rows • Generated {new Date().toLocaleString()}
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
            <Button variant="outline" size="sm">
              <MdFullscreen className="w-4 h-4" />
            </Button>
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

        {/* Charts */}
        {data.charts && data.charts.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Charts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.charts.map((chart, index) => (
                <div key={index} className="bg-gray-100 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">{chart.title}</h5>
                  <div className="h-48 bg-white rounded border flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-sm">{chart.type} Chart</div>
                      <div className="text-xs">Chart visualization would appear here</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
      </div>
    </Card>
  );
};

export default ReportPreview;
