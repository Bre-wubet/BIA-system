import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getKPIById, 
  getKPIValuesHistory, 
  getKPILatestValue,
  calculateKPIValue,
  getKPIAnalytics,
  getKPIPredictions,
  getKPIAlerts
} from "../../../api/kpisApi";
import { format } from 'date-fns';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import Alert from '../../../components/ui/Alert';
import Badge from '../../../components/ui/Badge';
import Tooltip from '../../../components/ui/Tooltip';
import EmptyState from '../../../components/ui/EmptyState';
import LineChart from '../../../components/charts/LineChart';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';
import KPIWidget from '../../../components/charts/KPIWidget';
import { ROLE_PERMISSIONS, ROLES } from '../../../constants/roles';
import {
  MdRefresh,
  MdEdit,
  MdShare,
  MdDownload,
  MdTrendingUp,
  MdTrendingDown,
  MdWarning,
  MdCheckCircle,
  MdError,
  MdAnalytics,
  MdSpeed,
  MdGpsFixed,
  MdSchedule,
  MdContentCopy,
  MdMoreVert,
  MdShowChart,
  MdCalculate,
  MdHistory,
  MdInsights
} from "react-icons/md";

export default function KpiViewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [kpi, setKpi] = useState(null);
  const [history, setHistory] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({});
  const [predictions, setPredictions] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [userRole] = useState(ROLES.ADMIN);
  const [activeTab, setActiveTab] = useState('overview');
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    fetchData();
  }, [id]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing && kpi) {
        fetchKPIHistory();
        fetchLatestValue();
        fetchAnalytics();
        fetchAlerts();
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [refreshing, kpi]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchKPIDetails(),
        fetchKPIHistory(),
        fetchLatestValue(),
        fetchAnalytics(),
        fetchAlerts(),
        fetchPredictions()
      ]);
    } catch (err) {
      console.error("Error fetching KPI data:", err);
      setError("Failed to load KPI details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchKPIDetails = async () => {
    try {
      const kpiRes = await getKPIById(id);
      setKpi(kpiRes.data || kpiRes);
    } catch (err) {
      console.error("Error fetching KPI details:", err);
      throw err;
    }
  };

  const fetchKPIHistory = async () => {
    try {
      const historyRes = await getKPIValuesHistory(id, 100);
      setHistory(Array.isArray(historyRes) ? historyRes : []);
    } catch (err) {
      console.error("Error fetching KPI history:", err);
      throw err;
    }
  };

  const fetchLatestValue = async () => {
    try {
      const latestRes = await getKPILatestValue(id);
      setLatest(latestRes?.data || latestRes);
    } catch (err) {
      console.error("Error fetching latest value:", err);
      throw err;
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await getKPIAnalytics();
      setAnalytics(data || {});
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const data = await getKPIAlerts();
      setAlerts(data || []);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    }
  };

  const fetchPredictions = async () => {
    try {
      const data = await getKPIPredictions();
      setPredictions(data || {});
    } catch (err) {
      console.error("Error fetching predictions:", err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchKPIHistory(),
        fetchLatestValue(),
        fetchAnalytics(),
        fetchAlerts(),
        fetchPredictions()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCalculate = async () => {
    try {
      await calculateKPIValue(id);
      await fetchLatestValue();
      await fetchKPIHistory();
    } catch (err) {
      console.error("Error calculating KPI:", err);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("KPI link copied to clipboard!");
  };

  const handleExport = () => {
    // Implement export functionality
    console.log("Export KPI data");
  };

  const formatNumber = (num) =>
    num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Calculate KPI performance metrics
  const performanceMetrics = useMemo(() => {
    if (!latest || !kpi?.target_value) return null;

    const currentValue = parseFloat(latest.value || 0);
    const targetValue = parseFloat(kpi.target_value);
    const isOnTarget = currentValue >= targetValue;
    const performanceRatio = (currentValue / targetValue) * 100;
    const variance = currentValue - targetValue;
    const variancePercent = ((currentValue - targetValue) / targetValue) * 100;

    return {
      isOnTarget,
      performanceRatio,
      variance,
      variancePercent,
      currentValue,
      targetValue
    };
  }, [latest, kpi]);

  // Get chart data
  const getChartData = () => {
    if (history.length === 0) return { labels: [], datasets: [] };

    const isBreakdown = history.some(v => v.breakdown && Array.isArray(v.breakdown));
    
    if (isBreakdown) {
      const latest = history[history.length - 1];
      return {
        labels: latest.breakdown.map(item => item.name),
        datasets: [{
          label: kpi.name,
          data: latest.breakdown.map(item => parseFloat(item.value)),
          backgroundColor: [
            "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"
          ]
        }]
      };
    }

    const values = history
      .filter(v => v.calculated_at)
      .sort((a, b) => new Date(a.calculated_at) - new Date(b.calculated_at));

    return {
      labels: values.map(v => format(new Date(v.calculated_at), "MMM d, HH:mm")),
      datasets: [{
        label: "Value",
        data: values.map(v => parseFloat(v.value)),
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.4,
        fill: true
      }]
    };
  };

  // Get trend analysis
  const trendAnalysis = useMemo(() => {
    if (history.length < 2) return null;

    const values = history
      .filter(v => v.calculated_at)
      .sort((a, b) => new Date(a.calculated_at) - new Date(b.calculated_at))
      .map(v => parseFloat(v.value));

    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const change = lastValue - firstValue;
    const changePercent = (change / firstValue) * 100;
    const isPositive = change > 0;

    return {
      change,
      changePercent,
      isPositive,
      firstValue,
      lastValue
    };
  }, [history]);

  if (loading) {
    return <LoadingSpinner size="large" message="Loading KPI details..." />;
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Error Loading KPI"
        message={error}
        action={
          <Button onClick={fetchData} variant="primary">
            Retry
          </Button>
        }
      />
    );
  }

  if (!kpi) {
    return (
      <EmptyState
        icon={<MdAnalytics className="w-16 h-16 text-gray-400" />}
        title="KPI Not Found"
        description="The requested KPI could not be found or you don't have permission to view it."
        action={
          <Button onClick={() => navigate('/kpis')} variant="primary">
            Back to KPIs
          </Button>
        }
      />
    );
  }

  const isBreakdown = latest?.breakdown && Array.isArray(latest.breakdown);
  const displayValue = isBreakdown
    ? latest?.breakdown.reduce((sum, row) => sum + parseFloat(row.value), 0)
    : parseFloat(latest?.value || 0);

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{kpi.name}</h1>
              {performanceMetrics?.isOnTarget ? (
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
            <p className="text-gray-600 mb-3">{kpi.description || 'No description available'}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MdAnalytics className="text-green-500" />
                {kpi.category || 'Uncategorized'}
              </span>
              <span className="flex items-center gap-1">
                <MdSchedule className="text-blue-500" />
                {kpi.refresh_frequency || 'Custom'} refresh
              </span>
              <span className="flex items-center gap-1">
                <MdHistory className="text-purple-500" />
                {history.length} data points
              </span>
              {alerts.length > 0 && (
                <span className="flex items-center gap-1">
                  <MdWarning className="text-orange-500" />
                  {alerts.length} alerts
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip content="Refresh KPI">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                disabled={refreshing}
              >
                <MdRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </Tooltip>
            <Tooltip content="Calculate KPI">
              <Button onClick={handleCalculate} variant="outline" size="sm">
                <MdCalculate className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Share KPI">
              <Button onClick={handleShare} variant="outline" size="sm">
                <MdShare className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Export data">
              <Button onClick={handleExport} variant="outline" size="sm">
                <MdDownload className="w-4 h-4" />
              </Button>
            </Tooltip>
            {ROLE_PERMISSIONS[userRole].canEdit && (
              <Button onClick={() => navigate(`/kpis/${id}/edit`)} variant="primary" size="sm">
                <MdEdit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert, index) => (
            <Alert
              key={index}
              type={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'}
              title={alert.title}
              message={alert.message}
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

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIWidget
          title="Current Value"
          value={displayValue.toLocaleString()}
          unit={kpi.unit}
          icon={<MdAnalytics className="w-5 h-5 text-blue-600" />}
          trend={trendAnalysis?.isPositive ? "up" : "down"}
          change={trendAnalysis?.changePercent?.toFixed(1)}
        />
        {kpi.target_value && (
          <KPIWidget
            title="Target"
            value={parseFloat(kpi.target_value).toLocaleString()}
            unit={kpi.unit}
            icon={<MdGpsFixed className="w-5 h-5 text-green-600" />}
            trend={performanceMetrics?.isOnTarget ? "up" : "down"}
          />
        )}
        <KPIWidget
          title="Performance"
          value={performanceMetrics?.performanceRatio?.toFixed(1) || 'N/A'}
          unit="%"
          icon={<MdSpeed className="w-5 h-5 text-purple-600" />}
          trend={performanceMetrics?.isOnTarget ? "up" : "down"}
        />
        <KPIWidget
          title="Data Points"
          value={history.length}
          icon={<MdHistory className="w-5 h-5 text-orange-600" />}
          trend="up"
        />
      </div>

      {/* Tab Navigation */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: MdAnalytics },
              { id: 'chart', label: 'Chart', icon: MdShowChart },
              { id: 'analytics', label: 'Analytics', icon: MdInsights },
              { id: 'predictions', label: 'Predictions', icon: MdAnalytics },
              { id: 'history', label: 'History', icon: MdHistory }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* KPI Details */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">KPI Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2 font-medium">{kpi.category || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 font-medium">{kpi.type || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Unit:</span>
                  <span className="ml-2 font-medium">{kpi.unit || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 font-medium ${kpi.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Refresh:</span>
                  <span className="ml-2 font-medium">{kpi.refresh_frequency || 'Custom'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="ml-2 font-medium">
                    {latest?.calculated_at 
                      ? format(new Date(latest.calculated_at), 'MMM d, yyyy HH:mm')
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
              {kpi.formula && (
                <div>
                  <span className="text-gray-500 text-sm">Formula:</span>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded mt-1">{kpi.formula}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Performance Metrics */}
          {performanceMetrics && (
            <Card>
              <h3 className="text-lg font-semibold mb-4">Performance Analysis</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {performanceMetrics.performanceRatio.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">of target achieved</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      performanceMetrics.isOnTarget ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(performanceMetrics.performanceRatio, 100)}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Variance:</span>
                    <span className={`ml-2 font-medium ${
                      performanceMetrics.variance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {performanceMetrics.variance >= 0 ? '+' : ''}{performanceMetrics.variance.toFixed(2)} {kpi.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Variance %:</span>
                    <span className={`ml-2 font-medium ${
                      performanceMetrics.variancePercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {performanceMetrics.variancePercent >= 0 ? '+' : ''}{performanceMetrics.variancePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'chart' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">KPI Trend</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Chart Type:</span>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="line">Line</option>
                <option value="bar">Bar</option>
                <option value="pie">Pie</option>
              </select>
            </div>
          </div>
          {history.length > 0 ? (
            <div className="h-96">
              {chartType === 'line' && (
                <LineChart data={getChartData()} height={300} showLegend={false} />
              )}
              {chartType === 'bar' && (
                <BarChart data={getChartData()} height={300} showLegend={false} />
              )}
              {chartType === 'pie' && (
                <PieChart data={getChartData()} height={300} />
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <MdShowChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No chart data available</p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Trend Analysis</h3>
            {trendAnalysis ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    trendAnalysis.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trendAnalysis.isPositive ? '+' : ''}{trendAnalysis.changePercent.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">change over time</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">First Value:</span>
                    <span className="ml-2 font-medium">{trendAnalysis.firstValue.toLocaleString()} {kpi.unit}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Latest Value:</span>
                    <span className="ml-2 font-medium">{trendAnalysis.lastValue.toLocaleString()} {kpi.unit}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Insufficient data for trend analysis</p>
            )}
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4">Statistics</h3>
            {history.length > 0 ? (
              <div className="space-y-3">
                {(() => {
                  const values = history.map(v => parseFloat(v.value));
                  const min = Math.min(...values);
                  const max = Math.max(...values);
                  const avg = values.reduce((a, b) => a + b, 0) / values.length;
                  const median = values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
                  
                  return (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Minimum:</span>
                        <span className="ml-2 font-medium">{min.toLocaleString()} {kpi.unit}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Maximum:</span>
                        <span className="ml-2 font-medium">{max.toLocaleString()} {kpi.unit}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Average:</span>
                        <span className="ml-2 font-medium">{avg.toLocaleString()} {kpi.unit}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Median:</span>
                        <span className="ml-2 font-medium">{median.toLocaleString()} {kpi.unit}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <p className="text-gray-500">No data available for statistics</p>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'predictions' && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Predictions</h3>
          {predictions[id] ? (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MdPrediction className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Next Period Forecast</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {predictions[id].next_value?.toLocaleString()} {kpi.unit}
                </div>
                {predictions[id].confidence && (
                  <div className="text-sm text-blue-700">
                    Confidence: {predictions[id].confidence}%
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MdPrediction className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No predictions available</p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'history' && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Data History</h3>
          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-200 p-3 text-left">Date</th>
                    <th className="border border-gray-200 p-3 text-left">Value</th>
                    <th className="border border-gray-200 p-3 text-left">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {history
                    .sort((a, b) => new Date(b.calculated_at) - new Date(a.calculated_at))
                    .map((item, i) => {
                      const prevValue = i < history.length - 1 ? parseFloat(history[i + 1].value) : null;
                      const change = prevValue ? parseFloat(item.value) - prevValue : null;
                      const changePercent = change && prevValue ? (change / prevValue) * 100 : null;
                      
                      return (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="border border-gray-200 p-3">
                            {formatDate(item.calculated_at)}
                          </td>
                          <td className="border border-gray-200 p-3 font-medium">
                            {formatNumber(item.value)} {kpi.unit}
                          </td>
                          <td className="border border-gray-200 p-3">
                            {change !== null ? (
                              <span className={`text-sm ${
                                change >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {change >= 0 ? '+' : ''}{change.toFixed(2)} 
                                {changePercent && ` (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%)`}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <MdHistory className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No history data available</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
