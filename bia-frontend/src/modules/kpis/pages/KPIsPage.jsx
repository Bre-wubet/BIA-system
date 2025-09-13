import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  getAllKPIs,
  getKPIStats,
  getKPIValuesHistory,
  getKPILatestValue,
  calculateKPIValue,
  batchCalculateKPIs,
  getKPIAnalytics,
  getKPIPredictions,
  getKPIAlerts
} from '../../../api/kpisApi';
import { ROLE_PERMISSIONS, ROLES } from '../../../constants/roles';
import { KPI_CATEGORIES } from '../../../constants/chartConfig';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import KPIWidget from '../../../components/charts/KPIWidget';
import LineChart from '../../../components/charts/LineChart';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';
import SearchInput from '../../../components/ui/SearchInput';
import FilterDropdown from '../../../components/ui/FilterDropdown';
import ToggleSwitch from '../../../components/ui/ToggleSwitch';
import Badge from '../../../components/ui/Badge';
import Tooltip from '../../../components/ui/Tooltip';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import EmptyState from '../../../components/ui/EmptyState';
import Alert from '../../../components/ui/Alert';

import { 
  MdTrendingUp, 
  MdTrendingDown, 
  MdWarning, 
  MdCheckCircle, 
  MdError,
  MdRefresh,
  MdFilterList,
  MdSearch,
  MdAnalytics,
  MdSchedule,
  MdNotifications,
  MdViewModule,
  MdViewList,
  MdMoreVert,
  MdAdd,
  MdCalculate,
  MdShowChart,
  MdSpeed,
  MdGpsFixed,
  MdEdit
} from 'react-icons/md';

const KPIsPage = () => {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAlerts, setShowAlerts] = useState(true);
  const [userRole, setUserRole] = useState(ROLES.ADMIN);
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [predictions, setPredictions] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [kpiHistory, setKpiHistory] = useState({});
  const [kpiLatest, setKpiLatest] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchKPIs();
    fetchKPIStats();
    fetchKPIAnalytics();
    fetchKPIAlerts();
  }, []);

  useEffect(() => {
    if (kpis.length > 0) {
      fetchKPIValuesHistory();
      fetchLatestValues();
      fetchKPIPredictions();
    }
  }, [kpis]);

  // Auto-refresh every 2 minutes for KPIs
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing) {
        fetchKPIs();
        fetchKPIStats();
        fetchKPIAlerts();
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [refreshing]);

  const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'N/A' : format(date, 'MM/dd/yyyy hh:mm a');
};
  // Fetch all KPIs
  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const res = await getAllKPIs();
      setKpis(res.data || []);
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    } finally {
      setLoading(false);
    }
  };
  // Fetch KPI statistics
  const fetchKPIStats = async () => {
    try {
      const data = await getKPIStats();
      setStats(data || {});
    } catch (error) {
      console.error('Error fetching KPI stats:', error);
    }
  };

  // Fetch KPI analytics
  const fetchKPIAnalytics = async () => {
    try {
      const data = await getKPIAnalytics();
      setAnalytics(data || {});
    } catch (error) {
      console.error('Error fetching KPI analytics:', error);
    }
  };

  // Fetch KPI predictions
  const fetchKPIPredictions = async () => {
    try {
      const data = await getKPIPredictions();
      setPredictions(data || {});
    } catch (error) {
      console.error('Error fetching KPI predictions:', error);
    }
  };

  // Fetch KPI alerts
  const fetchKPIAlerts = async () => {
    try {
      const data = await getKPIAlerts();
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching KPI alerts:', error);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchKPIs(),
        fetchKPIStats(),
        fetchKPIAnalytics(),
        fetchKPIAlerts()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch KPI values history for all KPIs in parallel
const fetchKPIValuesHistory = async () => {
  try {
    const valuesArr = await Promise.all(
      kpis.map(async (kpi) => {
        try {
          const res = await getKPIValuesHistory(kpi.id, 50);
          console.log("History for KPI", kpi.id, res);
          // ✅ res is already an array of rows, not an object with data
          const data = Array.isArray(res) ? res : [];
          return { kpiId: kpi.id, values: data };
        } catch (error) {
          console.error(`Error fetching values history for KPI ${kpi.id}:`, error);
          return { kpiId: kpi.id, values: [] };
        }
      })
    );

    const historyMap = {};
    valuesArr.forEach(({ kpiId, values }) => {
      historyMap[kpiId] = values;
    });

    setKpiHistory(historyMap);
  } catch (error) {
    console.error('Error fetching KPI values history:', error);
  }
};

  // Fetch latest KPI value for each KPI
  const fetchLatestValues = async () => {
    try {
      const latestArr = await Promise.all(
        kpis.map(async (kpi) => {
          try {
            const res = await getKPILatestValue(kpi.id);
            return { kpiId: kpi.id, latest: res?.data || null };
          } catch (error) {
            console.error(`Error fetching latest value for KPI ${kpi.id}:`, error);
            return { kpiId: kpi.id, latest: null };
          }
        })
      );

      const latestMap = {};
      latestArr.forEach(({ kpiId, latest }) => {
        latestMap[kpiId] = latest;
      });

      setKpiLatest(latestMap);
    } catch (error) {
      console.error('Error fetching latest KPI values:', error);
    }
  };
  const handleCalculateKPI = async (kpiId) => {
    try {
      await calculateKPIValue(kpiId);
      await fetchKPIValuesHistory();
      await fetchKPIStats();
    } catch (error) {
      console.error('Error calculating KPI:', error);
    }
  };

  const handleBatchCalculate = async () => {
    try {
      await batchCalculateKPIs();
      await fetchKPIValuesHistory();
      await fetchKPIStats();
    } catch (error) {
      console.error('Error batch calculating KPIs:', error);
    }
  };

  // Filter and sort KPIs
  const filteredAndSortedKPIs = useMemo(() => {
    let filtered = kpis.filter(kpi => {
      const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           kpi.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || kpi.category === selectedCategory;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && kpi.is_active) ||
                           (filterStatus === 'inactive' && !kpi.is_active) ||
                           (filterStatus === 'on_target' && kpi.target_value && 
                            kpiLatest[kpi.id]?.value >= parseFloat(kpi.target_value)) ||
                           (filterStatus === 'off_target' && kpi.target_value && 
                            kpiLatest[kpi.id]?.value < parseFloat(kpi.target_value));
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort KPIs
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'updated_at' || sortBy === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === 'current_value') {
        aValue = parseFloat(kpiLatest[a.id]?.value || 0);
        bValue = parseFloat(kpiLatest[b.id]?.value || 0);
      } else if (sortBy === 'performance') {
        aValue = a.target_value ? (parseFloat(kpiLatest[a.id]?.value || 0) / parseFloat(a.target_value)) : 0;
        bValue = b.target_value ? (parseFloat(kpiLatest[b.id]?.value || 0) / parseFloat(b.target_value)) : 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [kpis, searchTerm, selectedCategory, filterStatus, sortBy, sortOrder, kpiLatest]);

  const getChartData = (kpi) => {
    const history = kpiHistory[kpi.id] || [];

    if (history.length === 0) return { labels: [], datasets: [] };

    // Detect if KPI is breakdown type
    const isBreakdown = history.some(v => v.breakdown && Array.isArray(v.breakdown));

    if (isBreakdown) {
      // For Pie or Bar chart, use latest breakdown
      const latest = history[history.length - 1];
      const labels = latest.breakdown.map(item => item.name);
      const dataValues = latest.breakdown.map(item => parseFloat(item.value));

      return {
        labels,
        datasets: [
          {
            label: kpi.name,
            data: dataValues,
            backgroundColor: [
              "#3B82F6",
              "#EF4444",
              "#10B981",
              "#F59E0B",
              "#8B5CF6"
            ],
          },
        ],
      };
    }

    // Scalar KPI trend chart
    const values = history
      .filter(v => v.calculated_at && !isNaN(new Date(v.calculated_at).getTime()))
      .sort((a, b) => new Date(a.calculated_at) - new Date(b.calculated_at));

    const labels = values.map(v => format(new Date(v.calculated_at), "MMM d, HH:mm"));
    const dataValues = values.map(v => parseFloat(v.value));

    return {
      labels,
      datasets: [
        {
          label: "Value",
          data: dataValues,
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59,130,246,0.2)",
          tension: 0.4,
          fill: true,
          pointRadius: 3,
        },
        ...(kpi.target_value
          ? [{
              label: "Target",
              data: Array(values.length).fill(Number(kpi.target_value)),
              borderColor: "#EF4444",
              borderDash: [6, 6],
              borderWidth: 2,
              pointRadius: 0,
              fill: false,
            }]
          : []),
      ],
    };
  };

  const getChartOptions = (kpiId, unit) => {
    const history = kpiHistory[kpiId] || [];
    const values = history.map(v => Number(v.value)).filter(v => !isNaN(v));

    if (values.length === 0) {
      // no values at all → disable chart axis
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { display: false },
          y: { display: false },
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
      };
    }

    let min = Math.min(...values);
    let max = Math.max(...values);

    // if all values are equal, add ±10% buffer
    if (min === max) {
      min = min * 0.9;
      max = max * 1.1 || 1; // fallback if value is 0
    } else {
      min = min * 0.9;
      max = max * 1.1;
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "category",
          ticks: {
            autoSkip: true,
            maxRotation: 45,
            maxTicksLimit: 6,
          },
          title: { display: true, text: "Time" },
        },
        y: {
          suggestedMin: min,
          suggestedMax: max,
          ticks: {
            callback: (val) => val.toLocaleString(),
          },
          title: { display: true, text: unit || "Value" },
        },
      },
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.formattedValue} ${unit || ""}`,
          },
        },
      },
    };
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Loading KPIs..." />;
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-900 flex items-center gap-3">
              <MdAnalytics className="text-green-600" />
              Key Performance Indicators
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor and analyze your business metrics with real-time insights
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MdTrendingUp className="text-green-500" />
                {analytics.performance_trend || '0%'} performance improvement
              </span>
              <span className="flex items-center gap-1">
                <MdSchedule className="text-blue-500" />
                Last updated: {new Date().toLocaleTimeString()}
              </span>
              <span className="flex items-center gap-1">
                <MdNotifications className="text-orange-500" />
                {alerts.length} active alerts
              </span>
            </div>
          </div>
          <div className="flex space-x-3">
            <Tooltip content="Refresh all KPIs">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                disabled={refreshing}
              >
                <MdRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </Tooltip>
            {ROLE_PERMISSIONS[userRole].canCreate && (
              <Button onClick={() => navigate(`/kpis/new-kpi`)} variant="success">
                <MdAdd className="w-4 h-4 mr-2" />
                New KPI
              </Button>
            )}
            <Button onClick={handleBatchCalculate} variant="primary">
              <MdCalculate className="w-4 h-4 mr-2" />
              Calculate All
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {showAlerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert, index) => (
            <Alert
              key={index}
              type={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'}
              title={alert.title}
              message={alert.message}
              onClose={() => setShowAlerts(false)}
            />
          ))}
          {alerts.length > 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/kpis/alerts')}
              className="w-full"
            >
              View All {alerts.length} Alerts
            </Button>
          )}
        </div>
      )}

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIWidget
          title="Total KPIs"
          value={kpis.length || 0}
          change={analytics.total_kpis_change || 0}
          icon={<MdAnalytics className="w-5 h-5 text-blue-600" />}
          trend="up"
        />
        <KPIWidget
          title="Active KPIs"
          value={kpis.filter(k => k.is_active === true).length || 0}
          change={analytics.active_kpis_change || 0}
          icon={<MdCheckCircle className="w-5 h-5 text-green-600" />}
          trend="up"
        />
        <KPIWidget
          title="On Target"
          value={kpis.filter(k => k.target_value && kpiLatest[k.id]?.value >= parseFloat(k.target_value)).length || 0}
          change={analytics.on_target_change || 0}
          icon={<MdGpsFixed className="w-5 h-5 text-green-600" />}
          trend="up"
        />
        <KPIWidget
          title="Alerts"
          value={alerts.length || 0}
          change={analytics.alerts_change || 0}
          icon={<MdWarning className="w-5 h-5 text-orange-600" />}
          trend="down"
        />
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1 max-w-md">
              <SearchInput
                placeholder="Search KPIs..."
                value={searchTerm}
                onChange={setSearchTerm}
                icon={<MdSearch className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-2">
              <FilterDropdown
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...Object.values(KPI_CATEGORIES).map(cat => ({
                    value: cat,
                    label: cat.charAt(0).toUpperCase() + cat.slice(1)
                  }))
                ]}
                value={selectedCategory}
                onChange={setSelectedCategory}
                icon={<MdFilterList className="w-4 h-4" />}
              />
              <FilterDropdown
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'on_target', label: 'On Target' },
                  { value: 'off_target', label: 'Off Target' }
                ]}
                value={filterStatus}
                onChange={setFilterStatus}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">View:</span>
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <MdViewModule className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <MdViewList className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <MdFilterList className="w-4 h-4 mr-1" />
              Filters
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="updated_at">Last Updated</option>
                  <option value="created_at">Created Date</option>
                  <option value="name">Name</option>
                  <option value="category">Category</option>
                  <option value="current_value">Current Value</option>
                  <option value="performance">Performance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setFilterStatus('all');
                    setSortBy('updated_at');
                    setSortOrder('desc');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Enhanced KPI Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredAndSortedKPIs.map((kpi) => {
            const latest = kpiLatest[kpi.id];
            const prediction = predictions[kpi.id];
            const isBreakdown = latest?.breakdown && Array.isArray(latest.breakdown);
            const displayValue = isBreakdown
              ? latest.breakdown.reduce((sum, row) => sum + parseFloat(row.value), 0)
              : parseFloat(latest?.value || 0);

            const isOnTarget = latest && kpi.target_value
              ? displayValue >= parseFloat(kpi.target_value)
              : false;

            const performanceRatio = kpi.target_value 
              ? (displayValue / parseFloat(kpi.target_value)) * 100 
              : 0;

            return (
              <Card key={kpi.id} className="hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  {/* KPI Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{kpi.name}</h3>
                        {isOnTarget ? (
                          <Badge variant="green" icon={<MdCheckCircle className="w-3 h-3" />}>
                            On Target
                          </Badge>
                        ) : kpi.target_value ? (
                          <Badge variant="red" icon={<MdWarning className="w-3 h-3" />}>
                            Off Target
                          </Badge>
                        ) : null}
                        {!kpi.is_active && (
                          <Badge variant="gray" icon={<MdError className="w-3 h-3" />}>
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{kpi.description || 'No description'}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Category: {kpi.category || 'Uncategorized'}</span>
                        <span>•</span>
                        <span>Type: {kpi.type || 'scalar'}</span>
                        <span>•</span>
                        <span>Updated: {formatDate(latest?.calculated_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tooltip content="More options">
                        <Button variant="ghost" size="sm">
                          <MdMoreVert className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>

                  {/* KPI Value and Performance */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    {latest ? (
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">
                            {isBreakdown ? (
                              <div className="space-y-1">
                                {latest.breakdown.map((item, idx) => (
                                  <div key={idx} className="flex justify-between">
                                    <span className="text-sm font-medium">{item.name}:</span>
                                    <span>{parseFloat(item.value).toLocaleString()} {kpi.unit}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <>
                                {displayValue.toLocaleString()}
                                <span className="text-lg text-gray-500 ml-1">{kpi.unit}</span>
                              </>
                            )}
                          </div>
                          {kpi.target_value && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Target: {kpi.target_value} {kpi.unit}</span>
                                <span className={`font-medium ${
                                  isOnTarget ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {performanceRatio.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className={`h-2 rounded-full ${
                                    isOnTarget ? 'bg-green-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(performanceRatio, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <MdError className="w-8 h-8 mx-auto mb-2" />
                        <p>No data available</p>
                      </div>
                    )}
                  </div>

                  {/* Prediction */}
                  {prediction && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <MdTrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Prediction</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Next period: {prediction.next_value?.toLocaleString()} {kpi.unit}
                        {prediction.confidence && (
                          <span className="ml-2 text-xs">
                            ({prediction.confidence}% confidence)
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Chart */}
                  {(kpiHistory[kpi.id]?.length ?? 0) > 0 ? (
                    <div className="mb-4">
                      {(() => {
                        switch (kpi.type) {
                          case "line":
                          case "area":
                            return (
                              <LineChart
                                data={getChartData(kpi)}
                                title={`${kpi.name} Trend`}
                                height={200}
                                showLegend={false}
                                showArea={kpi.type === "area"}
                                customOptions={getChartOptions(kpi.id, kpi.unit)}
                              />
                            );
                          case "bar":
                            return (
                              <BarChart
                                data={getChartData(kpi)}
                                title={`${kpi.name} Distribution`}
                                height={200}
                                showLegend={false}
                                customOptions={getChartOptions(kpi.id, kpi.unit)}
                              />
                            );
                          case "pie":
                            return (
                              <PieChart
                                data={getChartData(kpi)}
                                title={`${kpi.name} Breakdown`}
                                height={200}
                                customOptions={getChartOptions(kpi.id, kpi.unit)}
                              />
                            );
                          default:
                            return (
                              <LineChart
                                data={getChartData(kpi)}
                                title={`${kpi.name} Trend`}
                                height={200}
                                showLegend={false}
                                customOptions={getChartOptions(kpi.id, kpi.unit)}
                              />
                            );
                        }
                      })()}
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-4 mb-4 text-center">
                      <MdShowChart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No history data available</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Tooltip content="Calculate KPI">
                        <Button
                          onClick={() => handleCalculateKPI(kpi.id)}
                          variant="outline"
                          size="sm"
                        >
                          <MdCalculate className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                      {ROLE_PERMISSIONS[userRole].canEdit && (
                        <Tooltip content="Edit KPI">
                          <Button
                            onClick={() => navigate(`/kpis/${kpi.id}/edit`)}
                            variant="outline"
                            size="sm"
                          >
                            <MdEdit className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                    <Button
                      onClick={() => navigate(`/kpis/${kpi.id}/detail`)}
                      variant="primary"
                      size="sm"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedKPIs.map((kpi) => {
            const latest = kpiLatest[kpi.id];
            const isBreakdown = latest?.breakdown && Array.isArray(latest.breakdown);
            const displayValue = isBreakdown
              ? latest.breakdown.reduce((sum, row) => sum + parseFloat(row.value), 0)
              : parseFloat(latest?.value || 0);

            const isOnTarget = latest && kpi.target_value
              ? displayValue >= parseFloat(kpi.target_value)
              : false;

            return (
              <Card key={kpi.id} className="hover:shadow-md transition-shadow duration-200">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <MdAnalytics className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{kpi.name}</h3>
                          {isOnTarget ? (
                            <Badge variant="green" icon={<MdCheckCircle className="w-3 h-3" />}>
                              On Target
                            </Badge>
                          ) : kpi.target_value ? (
                            <Badge variant="red" icon={<MdWarning className="w-3 h-3" />}>
                              Off Target
                            </Badge>
                          ) : null}
                          {!kpi.is_active && (
                            <Badge variant="gray" icon={<MdError className="w-3 h-3" />}>
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{kpi.description || 'No description'}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Category: {kpi.category || 'Uncategorized'}</span>
                          <span>•</span>
                          <span>Current: {displayValue.toLocaleString()} {kpi.unit}</span>
                          {kpi.target_value && (
                            <>
                              <span>•</span>
                              <span>Target: {kpi.target_value} {kpi.unit}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>Updated: {formatDate(latest?.calculated_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleCalculateKPI(kpi.id)}
                        variant="outline"
                        size="sm"
                      >
                        <MdCalculate className="w-4 h-4 mr-1" />
                        Calculate
                      </Button>
                      <Button
                        onClick={() => navigate(`/kpis/${kpi.id}/detail`)}
                        variant="primary"
                        size="sm"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedKPIs.length === 0 && (
        <EmptyState
          icon={<MdAnalytics className="w-16 h-16 text-gray-400" />}
          title="No KPIs found"
          description={
            searchTerm || selectedCategory !== 'all' || filterStatus !== 'all'
              ? "Try adjusting your search or filter criteria"
              : "Create your first KPI to start tracking business performance"
          }
          action={
            ROLE_PERMISSIONS[userRole].canCreate && (
              <Button onClick={() => navigate('/kpis/new-kpi')} variant="primary">
                Create KPI
              </Button>
            )
          }
        />
      )}
    </div>
  );
};

export default KPIsPage;
