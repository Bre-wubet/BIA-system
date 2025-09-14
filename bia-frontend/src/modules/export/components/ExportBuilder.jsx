import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdDragIndicator,
  MdFilterList,
  MdSort,
  MdGroup
} from 'react-icons/md';

const ExportBuilder = ({ exportData, onExportDataChange }) => {
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const filterTypes = [
    { type: 'date_range', label: 'Date Range', icon: MdFilterList },
    { type: 'text', label: 'Text Filter', icon: MdFilterList },
    { type: 'number', label: 'Number Range', icon: MdFilterList },
    { type: 'select', label: 'Dropdown', icon: MdFilterList },
    { type: 'group', label: 'Group By', icon: MdGroup },
    { type: 'sort', label: 'Sort', icon: MdSort }
  ];

  const addFilter = (filterType) => {
    const newFilter = {
      id: Date.now().toString(),
      type: filterType,
      field: '',
      operator: getDefaultOperator(filterType),
      value: '',
      enabled: true
    };

    const updatedFilters = {
      ...exportData.filters,
      [newFilter.id]: newFilter
    };

    onExportDataChange({
      ...exportData,
      filters: updatedFilters
    });
  };

  const getDefaultOperator = (filterType) => {
    switch (filterType) {
      case 'date_range': return 'between';
      case 'text': return 'contains';
      case 'number': return 'equals';
      case 'select': return 'equals';
      default: return 'equals';
    }
  };

  const updateFilter = (filterId, updates) => {
    const updatedFilters = {
      ...exportData.filters,
      [filterId]: {
        ...exportData.filters[filterId],
        ...updates
      }
    };

    onExportDataChange({
      ...exportData,
      filters: updatedFilters
    });
  };

  const deleteFilter = (filterId) => {
    const updatedFilters = { ...exportData.filters };
    delete updatedFilters[filterId];

    onExportDataChange({
      ...exportData,
      filters: updatedFilters
    });
  };

  const getOperatorOptions = (filterType) => {
    switch (filterType) {
      case 'date_range':
        return [
          { value: 'between', label: 'Between' },
          { value: 'before', label: 'Before' },
          { value: 'after', label: 'After' },
          { value: 'equals', label: 'Equals' }
        ];
      case 'text':
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'equals', label: 'Equals' },
          { value: 'starts_with', label: 'Starts With' },
          { value: 'ends_with', label: 'Ends With' }
        ];
      case 'number':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'greater_than', label: 'Greater Than' },
          { value: 'less_than', label: 'Less Than' },
          { value: 'between', label: 'Between' }
        ];
      case 'select':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'not_equals', label: 'Not Equals' },
          { value: 'in', label: 'In' },
          { value: 'not_in', label: 'Not In' }
        ];
      default:
        return [{ value: 'equals', label: 'Equals' }];
    }
  };

  const renderFilterInput = (filter) => {
    switch (filter.type) {
      case 'date_range':
        return (
          <div className="flex space-x-2">
            <input
              type="date"
              value={filter.value?.start || ''}
              onChange={(e) => updateFilter(filter.id, {
                value: { ...filter.value, start: e.target.value }
              })}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="Start date"
            />
            {filter.operator === 'between' && (
              <>
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={filter.value?.end || ''}
                  onChange={(e) => updateFilter(filter.id, {
                    value: { ...filter.value, end: e.target.value }
                  })}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="End date"
                />
              </>
            )}
          </div>
        );
      case 'text':
        return (
          <input
            type="text"
            value={filter.value}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            placeholder="Enter text value"
          />
        );
      case 'number':
        return (
          <div className="flex space-x-2">
            <input
              type="number"
              value={filter.value?.min || ''}
              onChange={(e) => updateFilter(filter.id, {
                value: { ...filter.value, min: e.target.value }
              })}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="Min value"
            />
            {filter.operator === 'between' && (
              <>
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  value={filter.value?.max || ''}
                  onChange={(e) => updateFilter(filter.id, {
                    value: { ...filter.value, max: e.target.value }
                  })}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="Max value"
                />
              </>
            )}
          </div>
        );
      case 'select':
        return (
          <select
            value={filter.value}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="">Select value</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        );
      case 'group':
        return (
          <select
            value={filter.value}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="">Select field to group by</option>
            <option value="category">Category</option>
            <option value="date">Date</option>
            <option value="status">Status</option>
            <option value="user">User</option>
          </select>
        );
      case 'sort':
        return (
          <div className="flex space-x-2">
            <select
              value={filter.value?.field || ''}
              onChange={(e) => updateFilter(filter.id, {
                value: { ...filter.value, field: e.target.value }
              })}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="">Select field</option>
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="value">Value</option>
              <option value="status">Status</option>
            </select>
            <select
              value={filter.value?.direction || 'asc'}
              onChange={(e) => updateFilter(filter.id, {
                value: { ...filter.value, direction: e.target.value }
              })}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  const filters = Object.values(exportData.filters || {}).filter(filter => filter && filter.id);

  return (
    <div className="space-y-6">
      {/* Filter Types */}
      <div>
        <h3 className="text-lg font-medium mb-4">Add Filters & Sorting</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {filterTypes.map((filterType, index) => {
            const Icon = filterType.icon;
            return (
              <Button
                key={filterType.type || `filter-type-${index}`}
                onClick={() => addFilter(filterType.type)}
                variant="outline"
                size="sm"
                className="flex flex-col items-center space-y-1 p-3 h-auto"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{filterType.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Active Filters */}
      {filters.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Active Filters</h4>
          <div className="space-y-3">
            {filters.map((filter, index) => {
              const FilterIcon = filterTypes.find(ft => ft.type === filter.type)?.icon || MdFilterList;
              return (
                <Card key={filter.id || `filter-${index}`} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <FilterIcon className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-sm">{filterTypes.find(ft => ft.type === filter.type)?.label}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        filter.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {filter.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => updateFilter(filter.id, { enabled: !filter.enabled })}
                        variant="outline"
                        size="sm"
                      >
                        {filter.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        onClick={() => deleteFilter(filter.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <MdDelete className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Field
                      </label>
                      <select
                        value={filter.field}
                        onChange={(e) => updateFilter(filter.id, { field: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="">Select field</option>
                        <option value="date">Date</option>
                        <option value="name">Name</option>
                        <option value="value">Value</option>
                        <option value="status">Status</option>
                        <option value="category">Category</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Operator
                      </label>
                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        {getOperatorOptions(filter.type).map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Value
                      </label>
                      {renderFilterInput(filter)}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Export Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Row Limit
            </label>
            <input
              type="number"
              value={exportData.row_limit || ''}
              onChange={(e) => onExportDataChange({
                ...exportData,
                row_limit: parseInt(e.target.value) || null
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Leave empty for no limit"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Include Headers
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="include_headers"
                checked={exportData.include_headers !== false}
                onChange={(e) => onExportDataChange({
                  ...exportData,
                  include_headers: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="include_headers" className="ml-2 block text-sm text-gray-900">
                Include column headers
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Query */}
      {exportData.query && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Generated Query Preview</h4>
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
              {exportData.query}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportBuilder;
