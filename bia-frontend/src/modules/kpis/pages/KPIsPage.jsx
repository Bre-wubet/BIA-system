import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  getAllKPIs,
  getKPIStats,
  getKPIValuesHistory,
  getKPILatestValue,
  calculateKPIValue,
  batchCalculateKPIs
} from '../../../api/kpisApi';
import { KPI_CATEGORIES } from '../../../constants/chartConfig';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import KPIWidget from '../../../components/charts/KPIWidget';
import LineChart from '../../../components/charts/LineChart';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';

const KPIsPage = () => {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stats, setStats] = useState({});
  const [kpiHistory, setKpiHistory] = useState({});
  const [kpiLatest, setKpiLatest] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchKPIs();
    fetchKPIStats();
  }, []);

  useEffect(() => {
    if (kpis.length > 0) {
      fetchKPIValuesHistory();
      fetchLatestValues();
    }
  }, [kpis]);

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

  const filteredKPIs = selectedCategory === 'all'
    ? kpis
    : kpis.filter(kpi => kpi.category === selectedCategory);

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
          <h1 className="text-2xl font-bold text-green-900">Key Performance Indicators</h1>
          <p className="text-gray-600">Monitor and analyze your business metrics</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => navigate(`/kpis/new-kpi`)} variant="success">New KPI</Button>
          <Button onClick={handleBatchCalculate} variant="primary">Calculate All KPIs</Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIWidget title="Total KPIs" value={kpis.length || 0} />
        <KPIWidget title="Active KPIs" value={kpis.filter(k => k.is_active === true).length || 0} />
        <KPIWidget title="Categories" value={kpis.filter(k => k.category).length || 0} />
        <KPIWidget title="Last Updated" value={kpis[0]?.updated_at ? format(new Date(kpis[0].updated_at), 'hh:mm a MM/dd/yyyy') : 'Never'} />
      </div>

      {/* Category Filter */}
      <Card>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter by Category:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {Object.values(KPI_CATEGORIES).map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>
      </Card>

       {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredKPIs.map((kpi) => {
            const latest = kpiLatest[kpi.id];

            // Determine display value
            const isBreakdown = latest?.breakdown && Array.isArray(latest.breakdown);
            const displayValue = isBreakdown
              ? latest.breakdown.reduce((sum, row) => sum + parseFloat(row.value), 0)
              : parseFloat(latest?.value || 0);

            const isOnTarget =
              latest && kpi.target_value
                ? displayValue >= parseFloat(kpi.target_value)
                : false;

            return (
              <Card key={kpi.id} title={kpi.name} subtitle={kpi.description}>
                <div className="space-y-4">

                  {/* Latest KPI Value */}
                  {latest ? (
                    <div className="mt-2 space-y-2">
                      <div className="text-2xl font-bold">
                        {isBreakdown ? (
                          <div className="space-y-1">
                            {latest.breakdown.map((item, idx) => (
                              <div key={idx}>
                                <span className="font-semibold">{item.name}:</span>{" "}
                                {parseFloat(item.value).toLocaleString()} {kpi.unit}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            {displayValue.toLocaleString()}{" "}
                            <span className="text-gray-500 text-sm">{kpi.unit}</span>
                          </>
                        )}
                      </div>

                      {/* Target badge */}
                      {kpi.target_value && (
                        <div
                          className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                            isOnTarget
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          Target: {kpi.target_value} {kpi.unit}
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Last updated {formatDate(latest.calculated_at)}
                      </div>

                      {/* Chart */}
                      {(kpiHistory[kpi.id]?.length ?? 0) > 0 ? (
                        <div className="mt-4">
                          {(() => {
                            switch (kpi.type) {
                              case "line":
                              case "area":
                                return (
                                  <LineChart
                                    data={getChartData(kpi)}
                                    title={`${kpi.name} Trend`}
                                    height={250}
                                    showLegend={true}
                                    showArea={kpi.type === "area"}
                                    customOptions={getChartOptions(kpi.id, kpi.unit)}
                                  />
                                );
                              case "bar":
                                return (
                                  <BarChart
                                    data={getChartData(kpi)}
                                    title={`${kpi.name} Distribution`}
                                    height={250}
                                    showLegend={true}
                                    customOptions={getChartOptions(kpi.id, kpi.unit)}
                                  />
                                );
                              case "pie":
                                return (
                                  <PieChart
                                    data={getChartData(kpi)}
                                    title={`${kpi.name} Breakdown`}
                                    height={250}
                                    customOptions={getChartOptions(kpi.id, kpi.unit)}
                                  />
                                );
                              default:
                                return (
                                  <LineChart
                                    data={getChartData(kpi)}
                                    title={`${kpi.name} Trend`}
                                    height={250}
                                    showLegend={true}
                                    customOptions={getChartOptions(kpi.id, kpi.unit)}
                                  />
                                );
                            }
                          })()}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">
                          No history data available
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm mt-2">No values yet</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => handleCalculateKPI(kpi.id)}
                      variant="outline"
                      size="sm"
                    >
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
              </Card>
            );
          })}
        </div>

      {filteredKPIs.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">No KPIs found for the selected category.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default KPIsPage;
