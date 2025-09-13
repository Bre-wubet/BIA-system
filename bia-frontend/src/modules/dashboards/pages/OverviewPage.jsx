import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  getAllKPIs,
  getKPIStats,
  getKPIValuesHistory,
  getKPILatestValue,
  getKPIAnalytics,
  getKPIPredictions,
  getKPIAlerts,
} from '../../../api/kpisApi';
import { ROLES } from '../../../constants/roles';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import KPIWidget from '../../../components/charts/KPIWidget';
import BarChart from '../../../components/charts/BarChart';
import LineChart from '../../../components/charts/LineChart';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import Alert from '../../../components/ui/Alert';
import Badge from '../../../components/ui/Badge';
import Tooltip from '../../../components/ui/Tooltip';
import EmptyState from '../../../components/ui/EmptyState';
import {
  MdRefresh,
  MdTrendingUp,
  MdTrendingDown,
  MdWarning,
  MdCheckCircle,
  MdError,
  MdAnalytics,
  MdSpeed,
  MdSchedule,
  MdVisibility,
  MdContentCopy,
  MdDownload,
  MdSettings,
  MdInsights,
  MdDataUsage,
  MdStorage,
  MdCloudSync,
  MdSyncProblem,
  MdCheckCircleOutline,
  MdArrowForward,
  MdShowChart,
  MdCalculate,
  MdHistory,
  MdGpsFixed,
  MdAssessment,
  MdTimeline,
  MdBarChart,
  MdPieChart
} from 'react-icons/md';

const OverviewPage = () => {
  const [userRole, setUserRole] = useState(ROLES.ADMIN); // TODO: get from auth context
  const [kpis, setKpis] = useState([]);
  const [kpiStats, setKpiStats] = useState({});
  const [kpiLatest, setKpiLatest] = useState({});
  const [kpiHistory, setKpiHistory] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [predictions, setPredictions] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (kpis.length > 0) {
      fetchLatestValues();
      fetchKPIValuesHistory();
      fetchAnalytics();
      fetchPredictions();
      fetchAlerts();
    }
  }, [kpis]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing) {
        fetchAllData();
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [refreshing]);

  // Fetch all data
  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchKPIs(),
        fetchKPIStats(),
        fetchAnalytics(),
        fetchPredictions(),
        fetchAlerts()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load overview data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch all KPIs
  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const res = await getAllKPIs();
      setKpis(res.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      setError('Failed to load KPIs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch KPI statistics
  const fetchKPIStats = async () => {
    try {
      const data = await getKPIStats();
      setKpiStats(data || {});
    } catch (error) {
      console.error('Error fetching KPI stats:', error);
    }
  };

  // Fetch KPI history
  const fetchKPIValuesHistory = async () => {
    try {
      const valuesArr = await Promise.all(
        kpis.map(async (kpi) => {
          try {
            const res = await getKPIValuesHistory(kpi.id, 12); // last 12 points
            return { kpiId: kpi.id, values: Array.isArray(res) ? res : [] };
          } catch {
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
      console.error('Error fetching KPI history:', error);
    }
  };

  // Fetch latest KPI values
  const fetchLatestValues = async () => {
    try {
      const latestArr = await Promise.all(
        kpis.map(async (kpi) => {
          try {
            const res = await getKPILatestValue(kpi.id);
            return { kpiId: kpi.id, latest: res?.data || null };
          } catch {
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
      console.error('Error fetching latest values:', error);
    }
  };

  // Fetch KPI analytics
  const fetchAnalytics = async () => {
    try {
      const data = await getKPIAnalytics();
      setAnalytics(data || {});
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Fetch KPI predictions
  const fetchPredictions = async () => {
    try {
      const data = await getKPIPredictions();
      setPredictions(data || {});
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  // Fetch KPI alerts
  const fetchAlerts = async () => {
    try {
      const data = await getKPIAlerts();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  // Handler functions
  const handleRefresh = async () => {
    await fetchAllData();
  };

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
    // Refetch data with new time range
    fetchKPIValuesHistory();
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Select key KPIs per role
  const getRoleKPIs = () => {
    if (userRole === ROLES.SALES) {
      return kpis.filter(k => ['sales', 'orders', 'conversion_rate', 'avg_order_value'].includes(k.slug));
    }
    if (userRole === ROLES.HR) {
      return kpis.filter(k => ['employees', 'turnover_rate', 'performance_index', 'training_hours'].includes(k.slug));
    }
    if (userRole === ROLES.FINANCE) {
      return kpis.filter(k => ['revenue', 'expenses', 'profit_margin', 'cash_flow'].includes(k.slug));
    }
    return kpis.slice(0, 4); // fallback: show first 4 KPIs
  };

  const roleKPIs = getRoleKPIs();

  // Memoized calculations
  const performanceMetrics = useMemo(() => {
    const totalKPIs = roleKPIs.length;
    const activeKPIs = roleKPIs.filter(kpi => kpi.status === 'active').length;
    const onTargetKPIs = roleKPIs.filter(kpi => {
      const latest = kpiLatest[kpi.id];
      return latest && latest.value >= parseFloat(kpi.target_value || 0);
    }).length;
    
    return {
      total: totalKPIs,
      active: activeKPIs,
      onTarget: onTargetKPIs,
      successRate: totalKPIs > 0 ? Math.round((onTargetKPIs / totalKPIs) * 100) : 0
    };
  }, [roleKPIs, kpiLatest]);

  const recentAlerts = useMemo(() => {
    return alerts.slice(0, 5).map(alert => ({
      ...alert,
      severity: alert.severity || 'warning',
      timestamp: new Date(alert.created_at || alert.timestamp)
    }));
  }, [alerts]);

  if (loading) {
    return <LoadingSpinner size="large" message="Loading overview data..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error Loading Data" message={error} />
        <div className="mt-4">
          <Button onClick={handleRefresh} variant="primary">
            <MdRefresh className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {userRole === ROLES.SALES
                  ? 'Sales Overview'
                  : userRole === ROLES.HR
                  ? 'HR Overview'
                  : userRole === ROLES.FINANCE
                  ? 'Finance Overview'
                  : 'Business Overview'}
              </h1>
              <Badge variant="blue" icon={<MdAnalytics className="w-3 h-3" />}>
                {performanceMetrics.successRate}% Success Rate
              </Badge>
            </div>
            <p className="text-gray-600 mb-3">Key metrics and performance indicators for your role</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MdGpsFixed className="text-blue-500" />
                {performanceMetrics.total} Total KPIs
              </span>
              <span className="flex items-center gap-1">
                <MdCheckCircle className="text-green-500" />
                {performanceMetrics.active} Active
              </span>
              <span className="flex items-center gap-1">
                <MdGpsFixed className="text-purple-500" />
                {performanceMetrics.onTarget} On Target
              </span>
              <span className="flex items-center gap-1">
                <MdSchedule className="text-orange-500" />
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip content="Refresh data">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={refreshing}
              >
                <MdRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </Tooltip>
            <Button
              onClick={() => navigate('/kpis')}
              variant="outline"
              size="sm"
            >
              <MdAnalytics className="w-4 h-4 mr-1" />
              All KPIs
            </Button>
            <Button
              onClick={() => navigate('/dashboards')}
              variant="outline"
              size="sm"
            >
              <MdShowChart className="w-4 h-4 mr-1" />
              Dashboards
            </Button>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="primary"
              size="sm"
            >
              <MdSettings className="w-4 h-4 mr-1" />
              Customize
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" title="Data Loading Error" message={error} />
      )}

      {/* Recent Alerts */}
      {recentAlerts.length > 0 && (
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MdWarning className="w-5 h-5 text-orange-500" />
                Recent Alerts
              </h3>
              <Button
                onClick={() => navigate('/alerts')}
                variant="outline"
                size="sm"
              >
                View All
              </Button>
            </div>
            <div className="space-y-2">
              {recentAlerts.map((alert, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.severity === 'error' ? 'bg-red-500' :
                    alert.severity === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.message || alert.title}</p>
                    <p className="text-xs text-gray-500">
                      {format(alert.timestamp, 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <Badge
                    variant={alert.severity === 'error' ? 'red' : 'orange'}
                    size="sm"
                  >
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <div>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MdGpsFixed className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total KPIs</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.total}</p>
                <p className="text-xs text-gray-500">Active monitoring</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <div> 
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <MdCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">On Target</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.onTarget}</p>
                <p className="text-xs text-gray-500">Meeting goals</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <div>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MdTrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.successRate}%</p>
                <p className="text-xs text-gray-500">Overall performance</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <div>
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <MdWarning className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
                <p className="text-xs text-gray-500">Require attention</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* KPI Widgets */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Key Performance Indicators</h3>
            <div className="flex items-center gap-2">
              <select
                value={selectedTimeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
          
          {roleKPIs.length === 0 ? (
            <EmptyState
              icon={<MdAnalytics className="w-16 h-16 text-gray-400" />}
              title="No KPIs Available"
              description="No KPIs are configured for your role. Contact your administrator to set up KPIs."
              action={
                <Button onClick={() => navigate('/kpis')} variant="primary">
                  <MdAnalytics className="w-4 h-4 mr-2" />
                  View All KPIs
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roleKPIs.map((kpi) => {
                const latest = kpiLatest[kpi.id];
                const value = latest?.value ? parseFloat(latest.value).toLocaleString() : 'N/A';
                const change = kpiStats[kpi.slug]?.change || 0;
                const isPositive = change >= 0;
                
                return (
                  <div
                    key={kpi.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/kpis/${kpi.id}/detail`)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{kpi.name}</h4>
                      <div className="flex items-center gap-1">
                        {isPositive ? (
                          <MdTrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <MdTrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-xs font-medium ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Math.abs(change).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {value} {kpi.unit || ''}
                    </div>
                    <div className="text-xs text-gray-500">
                      Target: {parseFloat(kpi.target_value || 0).toLocaleString()} {kpi.unit || ''}
                    </div>
                    {latest && (
                      <div className="mt-2 text-xs text-gray-400">
                        Updated: {format(new Date(latest.calculated_at), 'MMM d, h:mm a')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roleKPIs.slice(0, 2).map((kpi) => {
          const history = kpiHistory[kpi.id] || [];
          const labels = history.map(v => format(new Date(v.calculated_at), "MMM d"));
          const values = history.map(v => parseFloat(v.value));
          const chartData = {
            labels,
            datasets: [{
              label: kpi.name,
              data: values,
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59,130,246,0.2)',
              tension: 0.4,
              fill: true,
            }]
          };
          
          return (
            <Card key={kpi.id}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{kpi.name}</h3>
                    <p className="text-sm text-gray-600">Performance over time</p>
                  </div>
                  <Button
                    onClick={() => navigate(`/kpis/${kpi.id}/detail`)}
                    variant="outline"
                    size="sm"
                  >
                    <MdArrowForward className="w-4 h-4" />
                  </Button>
                </div>
                {history.length > 0 ? (
                  <LineChart data={chartData} height={300} showLegend={false} />
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <MdShowChart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No data available</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* System Status */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <MdCheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">98%</div>
              <div className="text-sm text-green-700">System Uptime</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <MdSpeed className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">1.2s</div>
              <div className="text-sm text-blue-700">Avg Response Time</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <MdCloudSync className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">24/7</div>
              <div className="text-sm text-purple-700">Monitoring Active</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OverviewPage;
