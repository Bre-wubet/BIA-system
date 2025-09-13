import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getDashboardWithData,
  duplicateDashboard,
  deleteDashboard,
  setDefaultDashboard,
} from "../../../api/dashboardsApi";
import {
  getKPIValuesHistory,
  getKPILatestValue,
  calculateKPIValue,
  getKPIAnalytics,
  getKPIPredictions,
  getKPIAlerts,
} from "../../../api/kpisApi";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import LineChart from "../../../components/charts/LineChart";
import BarChart from "../../../components/charts/BarChart";
import PieChart from "../../../components/charts/PieChart";
import KPIWidget from "../../../components/charts/KPIWidget";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import Alert from "../../../components/ui/Alert";
import Badge from "../../../components/ui/Badge";
import Tooltip from "../../../components/ui/Tooltip";
import EmptyState from "../../../components/ui/EmptyState";
import { ROLE_PERMISSIONS, ROLES } from "../../../constants/roles";
import { format } from "date-fns";
import {
  MdRefresh,
  MdEdit,
  MdShare,
  MdMoreVert,
  MdTrendingUp,
  MdTrendingDown,
  MdWarning,
  MdCheckCircle,
  MdError,
  MdAnalytics,
  MdSpeed,
  MdGpsFixed,
  MdSchedule,
  MdVisibility,
  MdContentCopy,
  MdDownload,
  MdSettings
} from "react-icons/md";

const DashboardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [kpiHistory, setKpiHistory] = useState({});
  const [kpiLatest, setKpiLatest] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [predictions, setPredictions] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [userRole] = useState(ROLES.ADMIN);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch dashboard
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getDashboardWithData(id);
        setDashboard(res.data);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [id]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing && dashboard) {
        fetchKPIData();
        fetchAnalytics();
        fetchAlerts();
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [refreshing, dashboard]);

  // Fetch KPI data after dashboard loads
  useEffect(() => {
    if (!dashboard?.kpis || dashboard.kpis.length === 0) return;
    fetchKPIData();
    fetchAnalytics();
    fetchAlerts();
  }, [dashboard]);

  const fetchKPIData = async () => {
    if (!dashboard?.kpis || dashboard.kpis.length === 0) return;
    
    try {
      // History
      const historyArr = await Promise.all(
        dashboard.kpis.map(async (kpi) => {
          try {
            const res = await getKPIValuesHistory(kpi.id, 50);
            return { kpiId: kpi.id, values: Array.isArray(res) ? res : [] };
          } catch (err) {
            console.error("History error", kpi.id, err);
            return { kpiId: kpi.id, values: [] };
          }
        })
      );
      const historyMap = {};
      historyArr.forEach(({ kpiId, values }) => {
        historyMap[kpiId] = values;
      });
      setKpiHistory(historyMap);

      // Latest
      const latestArr = await Promise.all(
        dashboard.kpis.map(async (kpi) => {
          try {
            const res = await getKPILatestValue(kpi.id);
            return { kpiId: kpi.id, latest: res?.data || null };
          } catch (err) {
            console.error("Latest error", kpi.id, err);
            return { kpiId: kpi.id, latest: null };
          }
        })
      );
      const latestMap = {};
      latestArr.forEach(({ kpiId, latest }) => {
        latestMap[kpiId] = latest;
      });
      setKpiLatest(latestMap);
    } catch (err) {
      console.error("Error fetching KPI data", err);
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

  // Handlers
  const handleDelete = async () => {
    try {
      await deleteDashboard(id);
      navigate("/dashboards");
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  };

  const handleDuplicate = async () => {
    try {
      const copy = await duplicateDashboard(id, `${dashboard.name} Copy`);
      navigate(`/dashboards/${copy.id}`);
    } catch (err) {
      setError(err.message || "Duplicate failed");
    }
  };

  const handleSetDefault = async () => {
    try {
      await setDefaultDashboard(id);
      alert("Dashboard set as default");
    } catch (err) {
      setError(err.message || "Failed to set default");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchKPIData(),
        fetchAnalytics(),
        fetchAlerts(),
        fetchPredictions()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("Dashboard link copied to clipboard!");
  };

  const handleExport = () => {
    // Implement export functionality
    console.log("Export dashboard");
  };

  const handleCalculateKPI = async (kpiId) => {
    try {
      await calculateKPIValue(kpiId);
      // refresh latest + history
      const res = await getKPILatestValue(kpiId);
      setKpiLatest((prev) => ({ ...prev, [kpiId]: res?.data || null }));

      const hist = await getKPIValuesHistory(kpiId, 50);
      setKpiHistory((prev) => ({ ...prev, [kpiId]: Array.isArray(hist) ? hist : [] }));
    } catch (err) {
      console.error("Error calculating KPI", err);
    }
  };

  // Filter and search KPIs
  const filteredKPIs = useMemo(() => {
    if (!dashboard?.kpis) return [];
    
    return dashboard.kpis.filter(kpi => {
      const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           kpi.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || kpi.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [dashboard?.kpis, searchTerm, selectedCategory]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    if (!dashboard?.kpis) return [];
    const cats = [...new Set(dashboard.kpis.map(kpi => kpi.category).filter(Boolean))];
    return cats;
  }, [dashboard?.kpis]);

  // Chart helpers
  const getChartData = (kpi) => {
    const history = kpiHistory[kpi.id] || [];
    if (history.length === 0) return { labels: [], datasets: [] };

    const isBreakdown = history.some((v) => v.breakdown && Array.isArray(v.breakdown));
    if (isBreakdown) {
      const latest = history[history.length - 1];
      return {
        labels: latest.breakdown.map((item) => item.name),
        datasets: [
          {
            label: kpi.name,
            data: latest.breakdown.map((item) => parseFloat(item.value)),
          },
        ],
      };
    }

    const values = history
      .filter((v) => v.calculated_at)
      .sort((a, b) => new Date(a.calculated_at) - new Date(b.calculated_at));

    return {
      labels: values.map((v) => format(new Date(v.calculated_at), "MMM d, HH:mm")),
      datasets: [
        {
          label: "Value",
          data: values.map((v) => parseFloat(v.value)),
          borderColor: "#3B82F6",
        },
      ],
    };
  };

  // UI
  if (loading) {
    return <LoadingSpinner size="large" message="Loading dashboard..." />;
  }
  
  if (error) {
    return (
      <Alert
        type="error"
        title="Error Loading Dashboard"
        message={error}
        action={
          <Button onClick={() => window.location.reload()} variant="primary">
            Retry
          </Button>
        }
      />
    );
  }
  
  if (!dashboard) {
    return (
      <EmptyState
        icon={<MdAnalytics className="w-16 h-16 text-gray-400" />}
        title="Dashboard Not Found"
        description="The requested dashboard could not be found or you don't have permission to view it."
        action={
          <Button onClick={() => navigate('/dashboards')} variant="primary">
            Back to Dashboards
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{dashboard.name}</h1>
              {dashboard.is_default && (
                <Badge variant="blue" icon={<MdCheckCircle className="w-3 h-3" />}>
                  Default
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mb-3">{dashboard.description || 'No description available'}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MdAnalytics className="text-blue-500" />
                {filteredKPIs.length} KPIs
              </span>
              <span className="flex items-center gap-1">
                <MdSchedule className="text-green-500" />
                Last updated: {new Date().toLocaleTimeString()}
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
            <Tooltip content="Refresh dashboard">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                disabled={refreshing}
              >
                <MdRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </Tooltip>
            <Tooltip content="Share dashboard">
              <Button onClick={handleShare} variant="outline" size="sm">
                <MdShare className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Export dashboard">
              <Button onClick={handleExport} variant="outline" size="sm">
                <MdDownload className="w-4 h-4" />
              </Button>
            </Tooltip>
            {ROLE_PERMISSIONS[userRole].canEdit && (
              <Button onClick={() => navigate(`/dashboards/${id}/edit`)} variant="primary" size="sm">
                <MdEdit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            <div className="relative">
              <Button variant="outline" size="sm">
                <MdMoreVert className="w-4 h-4" />
              </Button>
            </div>
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

      {/* Search and Filter Controls */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search KPIs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
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
                <MdVisibility className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <MdSettings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* KPIs Section */}
      {filteredKPIs.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredKPIs.map((kpi) => {
            const latest = kpiLatest[kpi.id];
            const history = kpiHistory[kpi.id] || [];
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
                        <span>Updated: {latest?.calculated_at ? format(new Date(latest.calculated_at), 'MMM d, HH:mm') : 'Never'}</span>
                      </div>
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
                  {history.length > 0 ? (
                    <div className="mb-4">
                      {(() => {
                        switch (kpi.type) {
                          case "bar":
                            return <BarChart data={getChartData(kpi)} height={200} showLegend={false} />;
                          case "pie":
                            return <PieChart data={getChartData(kpi)} height={200} />;
                          default:
                            return <LineChart data={getChartData(kpi)} height={200} showLegend={false} />;
                        }
                      })()}
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-4 mb-4 text-center">
                      <MdAnalytics className="w-8 h-8 text-gray-400 mx-auto mb-2" />
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
                          <MdSpeed className="w-4 h-4" />
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
        <EmptyState
          icon={<MdAnalytics className="w-16 h-16 text-gray-400" />}
          title="No KPIs found"
          description={
            searchTerm || selectedCategory !== 'all'
              ? "Try adjusting your search or filter criteria"
              : "This dashboard doesn't have any KPIs yet"
          }
          action={
            ROLE_PERMISSIONS[userRole].canCreate && (
              <Button onClick={() => navigate('/kpis/new-kpi')} variant="primary">
                Add KPI
              </Button>
            )
          }
        />
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleDuplicate}>
            <MdContentCopy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          <Button variant="secondary" onClick={handleSetDefault}>
            <MdGpsFixed className="w-4 h-4 mr-2" />
            Set Default
          </Button>
        </div>
        {ROLE_PERMISSIONS[userRole].canDelete && (
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            <MdError className="w-4 h-4 mr-2" />
            Delete Dashboard
          </Button>
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete Dashboard"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete <strong>{dashboard.name}</strong>?</p>
          <p className="text-sm text-gray-600">This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardDetail;
