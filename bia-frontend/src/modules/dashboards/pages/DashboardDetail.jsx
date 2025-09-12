import React, { useEffect, useState } from "react";
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
} from "../../../api/kpisApi";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import LineChart from "../../../components/charts/LineChart";
import BarChart from "../../../components/charts/BarChart";
import PieChart from "../../../components/charts/PieChart";
import KPIWidget from "../../../components/charts/KPIWidget";
import { ROLE_PERMISSIONS, ROLES } from "../../../constants/roles";
import { format } from "date-fns";

const DashboardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [kpiHistory, setKpiHistory] = useState({});
  const [kpiLatest, setKpiLatest] = useState({});
  const [userRole] = useState(ROLES.ADMIN);

  // Fetch dashboard
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
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

  // Fetch KPI data after dashboard loads
  useEffect(() => {
    if (!dashboard?.kpis || dashboard.kpis.length === 0) return;

    const fetchKPIData = async () => {
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

    fetchKPIData();
  }, [dashboard]);

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (error) return <div className="text-red-500">{error}</div>;
  if (!dashboard) return <div>No dashboard found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-900">{dashboard.name}</h1>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleDuplicate}>Duplicate</Button>
          <Button variant="secondary" onClick={handleSetDefault}>Set Default</Button>
          {ROLE_PERMISSIONS[userRole].canDelete && (
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>Delete</Button>
          )}
        </div>
      </div>

      {/* KPIs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {dashboard.kpis && dashboard.kpis.length > 0 ? (
          dashboard.kpis.map((kpi) => {
            const latest = kpiLatest[kpi.id];
            const history = kpiHistory[kpi.id] || [];
            const isBreakdown = latest?.breakdown && Array.isArray(latest.breakdown);
            const displayValue = isBreakdown
              ? latest.breakdown.reduce((sum, row) => sum + parseFloat(row.value), 0)
              : parseFloat(latest?.value || 0);

            return (
              <Card key={kpi.id} title={kpi.name} subtitle={kpi.description}>
                <div className="space-y-4">
                  {/* Latest Value */}
                  {latest ? (
                    <div className="text-2xl font-bold">
                      {isBreakdown ? (
                        <div>
                          {latest.breakdown.map((b, i) => (
                            <div key={i}>{b.name}: {b.value} {kpi.unit}</div>
                          ))}
                        </div>
                      ) : (
                        <>
                          {displayValue.toLocaleString()}{" "}
                          <span className="text-gray-500 text-sm">{kpi.unit}</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No values yet</p>
                  )}

                  {/* Chart */}
                  {history.length > 0 ? (
                    <div className="mt-4">
                      {(() => {
                        switch (kpi.type) {
                          case "bar":
                            return <BarChart data={getChartData(kpi)} height={200} />;
                          case "pie":
                            return <PieChart data={getChartData(kpi)} height={200} />;
                          default:
                            return <LineChart data={getChartData(kpi)} height={200} />;
                        }
                      })()}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No history data available</p>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center border-t pt-4">
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
          })
        ) : (
          <p>No KPIs in this dashboard</p>
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete Dashboard"
      >
        <p>Are you sure you want to delete <b>{dashboard.name}</b>?</p>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardDetail;
