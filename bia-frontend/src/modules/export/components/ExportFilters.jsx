import React from 'react';
import Button from '../../../components/ui/Button';

import { MdClose, MdFilterList } from 'react-icons/md';

const ExportFilters = ({ filters, onFiltersChange, onClose }) => {
  const formats = [
    { value: '', label: 'All Formats' },
    { value: 'csv', label: 'CSV' },
    { value: 'excel', label: 'Excel' },
    { value: 'pdf', label: 'PDF' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' }
  ];

  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'processing', label: 'Processing' },
    { value: 'failed', label: 'Failed' },
    { value: 'pending', label: 'Pending' }
  ];

  const dateRanges = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const sources = [
    { value: '', label: 'All Sources' },
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'report', label: 'Report' },
    { value: 'data', label: 'Data' },
    { value: 'custom', label: 'Custom' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      format: '',
      status: '',
      dateRange: '',
      source: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <MdFilterList className="w-5 h-5 mr-2" />
          Filters
        </h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
            >
              Clear All
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
          >
            <MdClose className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Format Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format
          </label>
          <select
            value={filters.format}
            onChange={(e) => handleFilterChange('format', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {formats.map(format => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Source Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source
          </label>
          <select
            value={filters.source}
            onChange={(e) => handleFilterChange('source', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sources.map(source => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Size Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File Size
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="size"
                value=""
                checked={filters.size === ''}
                onChange={(e) => handleFilterChange('size', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">All Sizes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="size"
                value="small"
                checked={filters.size === 'small'}
                onChange={(e) => handleFilterChange('size', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Small (&lt; 1MB)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="size"
                value="large"
                checked={filters.size === 'large'}
                onChange={(e) => handleFilterChange('size', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Large (&gt; 10MB)</span>
            </label>
          </div>
        </div>

        {/* Public/Private Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visibility
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="visibility"
                value=""
                checked={filters.visibility === ''}
                onChange={(e) => handleFilterChange('visibility', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">All</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={filters.visibility === 'public'}
                onChange={(e) => handleFilterChange('visibility', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Public</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={filters.visibility === 'private'}
                onChange={(e) => handleFilterChange('visibility', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Private</span>
            </label>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            {filters.format && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Format: {formats.find(f => f.value === filters.format)?.label}
              </span>
            )}
            {filters.status && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Status: {statuses.find(s => s.value === filters.status)?.label}
              </span>
            )}
            {filters.dateRange && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Date: {dateRanges.find(d => d.value === filters.dateRange)?.label}
              </span>
            )}
            {filters.source && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Source: {sources.find(s => s.value === filters.source)?.label}
              </span>
            )}
            {filters.size && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Size: {filters.size}
              </span>
            )}
            {filters.visibility && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Visibility: {filters.visibility}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportFilters;
