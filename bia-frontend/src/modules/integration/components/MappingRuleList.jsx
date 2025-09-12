import React, { useState, useEffect } from 'react';
import * as integrationApi from '../../../api/integrationApi';
import MappingRuleForm from './MappingRuleForm';
import { toast } from 'react-toastify';
import { FiFilter, FiSearch, FiRefreshCw, FiInfo, FiAlertTriangle } from 'react-icons/fi';

const MappingRuleList = ({ dataSourceId }) => {
  const [mappingRules, setMappingRules] = useState([]);
  const [filteredRules, setFilteredRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [dataSource, setDataSource] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('source_field');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterType, setFilterType] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (dataSourceId) {
      fetchMappingRules();
      fetchDataSource();
    }
  }, [dataSourceId]);

  useEffect(() => {
    if (mappingRules.length > 0) {
      let filtered = [...mappingRules];

      // Filter by type (from transformation)
      if (filterType !== 'all') {
        filtered = filtered.filter((rule) => {
          const t = parseTransformation(rule.transformation);
          return t.type === filterType;
        });
      }

      // Search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter((rule) => {
          const t = parseTransformation(rule.transformation);
          return (
            (rule.source_field || '').toLowerCase().includes(searchLower) ||
            (rule.target_field || '').toLowerCase().includes(searchLower) ||
            (t.default || '').toString().toLowerCase().includes(searchLower)
          );
        });
      }

      // Sort
      filtered.sort((a, b) => {
        const fieldA = (a[sortField] || '').toString().toLowerCase();
        const fieldB = (b[sortField] || '').toString().toLowerCase();
        return sortDirection === 'asc'
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      });

      setFilteredRules(filtered);
    } else {
      setFilteredRules([]);
    }
  }, [mappingRules, searchTerm, filterType, sortField, sortDirection]);

  const parseTransformation = (transformation) => {
    if (!transformation) return {};
    if (typeof transformation === 'string') {
      try {
        return JSON.parse(transformation);
      } catch {
        return {};
      }
    }
    return transformation;
  };

  const fetchMappingRules = async () => {
    setLoading(true);
    setIsRefreshing(true);
    try {
      const res = await integrationApi.getMappingRules(dataSourceId);
      setMappingRules(res.data || []);
      setError(null);
      if (isRefreshing) toast.success('Mapping rules refreshed successfully');
    } catch (err) {
      console.error('Error fetching mapping rules:', err);
      setError('Failed to load mapping rules. Please try again.');
      setMappingRules([]);
      if (isRefreshing) toast.error('Failed to refresh mapping rules');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchDataSource = async () => {
    try {
      const data = await integrationApi.getDataSource(dataSourceId);
      setDataSource(data);
    } catch (err) {
      console.error('Error fetching data source:', err);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMappingRules();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddRule = () => {
    setEditingRule(null);
    setShowForm(true);
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setShowForm(true);
  };

  const handleDeleteRule = async (ruleId) => {
    if (window.confirm('Delete this mapping rule?')) {
      try {
        await integrationApi.deleteMappingRule(dataSourceId, ruleId);
        setMappingRules((prev) => prev.filter((r) => r.id !== ruleId));
        toast.success('Mapping rule deleted');
      } catch (err) {
        console.error('Error deleting rule:', err);
        toast.error('Failed to delete mapping rule');
      }
    }
  };

  const handleSaveRule = () => {
    setShowForm(false);
    setEditingRule(null);
    fetchMappingRules();
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingRule(null);
  };

  const getTransformationSummary = (rule) => {
    const t = parseTransformation(rule.transformation);
    if (!t || Object.keys(t).length === 0) return 'No transformations';

    return Object.entries(t)
      .map(([key, value]) => {
        if (key === 'lookupTable' && typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            return `Lookup: ${Object.keys(parsed).length} mappings`;
          } catch {
            return 'Invalid lookup table';
          }
        }
        if (value && value !== '') {
          return `${key}: ${value}`;
        }
        return null;
      })
      .filter(Boolean)
      .join(', ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        Loading mapping rules...
      </div>
    );
  }

  if (showForm) {
    return (
      <MappingRuleForm
        dataSourceId={dataSourceId}
        rule={editingRule}
        isEditing={!!editingRule}
        onSave={handleSaveRule}
        onCancel={handleCancelForm}
        onDelete={handleDeleteRule}
      />
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">Mapping Rules</h3>
            {dataSource && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {dataSource.name}
              </span>
            )}
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
              {filteredRules.length} of {mappingRules.length} rules
            </span>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded text-sm flex items-center"
              disabled={isRefreshing}
            >
              <FiRefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleAddRule}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Rule
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2"
            />
          </div>

          <div className="flex items-center space-x-1">
            <FiFilter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500 mr-2">Filter:</span>
            {['all', 'string', 'number', 'date', 'boolean'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 text-xs rounded-full ${
                  filterType === type
                    ? 'bg-blue-100 text-blue-800 font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 flex items-center">
          <FiAlertTriangle className="text-red-500 mr-2" />
          <p>{error}</p>
        </div>
      )}

      {/* Table */}
      {filteredRules.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {searchTerm || filterType !== 'all' ? (
            <>
              <p>No rules match your search/filter.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <FiInfo className="h-12 w-12 text-gray-400" />
              </div>
              <p className="mb-4">No mapping rules defined.</p>
              <button
                onClick={handleAddRule}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              >
                Create Your First Rule
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['source_field', 'target_field'].map((field) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      {field.replace('_', ' ')}
                      {sortField === field && <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Default</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transformations</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRules.map((rule) => {
                const t = parseTransformation(rule.transformation);
                return (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{rule.source_field}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{rule.target_field}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                          t.type === 'string'
                            ? 'bg-blue-100 text-blue-800'
                            : t.type === 'number'
                            ? 'bg-green-100 text-green-800'
                            : t.type === 'boolean'
                            ? 'bg-purple-100 text-purple-800'
                            : t.type === 'date'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {t.type || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {t.default !== undefined ? (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">{t.default}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">{getTransformationSummary(rule)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MappingRuleList;
