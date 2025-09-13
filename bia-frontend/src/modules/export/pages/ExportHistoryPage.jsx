import React, { useState, useEffect } from 'react';
import { getExportHistory, downloadExport } from '../../../api/exportsApi';
import { ROLES } from '../../../constants/roles';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import ExportFilters from '../components/ExportFilters';

import { 
  MdDownload, 
  MdRefresh, 
  MdFilterList,
  MdViewList,
  MdGridView,
  MdHistory
} from 'react-icons/md';

const ExportHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [filters, setFilters] = useState({
    format: '',
    status: '',
    dateRange: '',
    user: ''
  });
  const [userRole, setUserRole] = useState(ROLES.ADMIN);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getExportHistory();
      setHistory(res.data || []);
    } catch (error) {
      console.error('Error fetching export history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (exportId) => {
    try {
      await downloadExport(exportId);
    } catch (error) {
      console.error('Error downloading export:', error);
    }
  };

  const filteredHistory = history.filter(item => {
    if (filters.format && item.format !== filters.format) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.user && item.user_id !== filters.user) return false;
    return true;
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 flex items-center">
            <MdHistory className="w-6 h-6 mr-2" />
            Export History
          </h1>
          <p className="text-gray-600">View and manage export history</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => setShowFilters(!showFilters)} 
            variant="outline"
            className="flex items-center space-x-2"
          >
            <MdFilterList className="w-4 h-4" />
            <span>Filters</span>
          </Button>
          <div className="flex border border-gray-300 rounded-md">
            <Button
              onClick={() => setViewMode('grid')}
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              className="rounded-r-none"
            >
              <MdGridView className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              className="rounded-l-none"
            >
              <MdViewList className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={fetchHistory} variant="outline">
            <MdRefresh className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <ExportFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredHistory.length}</div>
            <div className="text-sm text-gray-600">Total Exports</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredHistory.filter(item => item.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredHistory.filter(item => item.status === 'processing').length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredHistory.filter(item => item.status === 'failed').length}
            </div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </Card>
      </div>

      {/* History List */}
      {viewMode === 'list' ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Export
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Format
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getFormatIcon(item.format)}</span>
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.format?.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.file_size ? `${(item.file_size / 1024 / 1024).toFixed(2)} MB` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.user_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {item.status === 'completed' && (
                        <Button
                          onClick={() => handleDownload(item.id)}
                          variant="outline"
                          size="sm"
                        >
                          <MdDownload className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHistory.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className="text-2xl">{getFormatIcon(item.format)}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium">{item.format?.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">
                      {item.file_size ? `${(item.file_size / 1024 / 1024).toFixed(2)} MB` : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">User:</span>
                    <span className="font-medium">{item.user_name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleTimeString()}
                  </div>
                  {item.status === 'completed' && (
                    <Button
                      onClick={() => handleDownload(item.id)}
                      variant="outline"
                      size="sm"
                    >
                      <MdDownload className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredHistory.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">No export history found.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ExportHistoryPage;
