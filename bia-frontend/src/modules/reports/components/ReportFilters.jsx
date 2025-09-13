import React from 'react';
import Button from '../../../components/ui/Button';

import { MdClose, MdFilterList } from 'react-icons/md';

const ReportFilters = ({ filters, onFiltersChange, onClose }) => {
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'financial', label: 'Financial' },
    { value: 'sales', label: 'Sales' },
    { value: 'hr', label: 'HR' },
    { value: 'operations', label: 'Operations' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'executive', label: 'Executive' },
    { value: 'custom', label: 'Custom' }
  ];

  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'paused', label: 'Paused' }
  ];

  const dateRanges = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const roles = [
    { value: '', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'analyst', label: 'Analyst' },
    { value: 'viewer', label: 'Viewer' },
    { value: 'sales', label: 'Sales' },
    { value: 'hr', label: 'HR' },
    { value: 'finance', label: 'Finance' },
    { value: 'operations', label: 'Operations' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: '',
      status: '',
      dateRange: '',
      role: ''
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
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
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

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {roles.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Scheduled Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scheduling
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="scheduled"
                value=""
                checked={filters.scheduled === ''}
                onChange={(e) => handleFilterChange('scheduled', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">All</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="scheduled"
                value="scheduled"
                checked={filters.scheduled === 'scheduled'}
                onChange={(e) => handleFilterChange('scheduled', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Scheduled</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="scheduled"
                value="manual"
                checked={filters.scheduled === 'manual'}
                onChange={(e) => handleFilterChange('scheduled', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Manual</span>
            </label>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            {filters.category && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Category: {categories.find(c => c.value === filters.category)?.label}
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
            {filters.role && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Role: {roles.find(r => r.value === filters.role)?.label}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportFilters;
