import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  getAllKPIs,
  getKPIStats,
  getKPIValuesHistory,
  getKPILatestValue,
} from '../../../api/kpisApi';
import { ROLES } from '../../../constants/roles';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import KPIWidget from '../../../components/charts/KPIWidget';
import BarChart from '../../../components/charts/BarChart';
import LineChart from '../../../components/charts/LineChart';

const OverviewPage = () => {
  const [userRole, setUserRole] = useState(ROLES.ADMIN); // TODO: get from auth context
  const [kpis, setKpis] = useState([]);
  const [kpiStats, setKpiStats] = useState({});
  const [kpiLatest, setKpiLatest] = useState({});
  const [kpiHistory, setKpiHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchKPIs();
    fetchKPIStats();
  }, []);

  useEffect(() => {
    if (kpis.length > 0) {
      fetchLatestValues();
      fetchKPIValuesHistory();
    }
  }, [kpis]);

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
          <h1 className="text-2xl font-bold text-gray-900">
            {userRole === ROLES.SALES
              ? 'Sales Overview'
              : userRole === ROLES.HR
              ? 'HR Overview'
              : userRole === ROLES.FINANCE
              ? 'Finance Overview'
              : 'Business Overview'}
          </h1>
          <p className="text-gray-600">Key metrics and performance indicators</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Role: <span className="font-medium capitalize">{userRole}</span>
          </div>
          <Button variant="outline" size="sm">Customize View</Button>
        </div>
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roleKPIs.map((kpi) => {
          const latest = kpiLatest[kpi.id];
          const value = latest?.value ? parseFloat(latest.value).toLocaleString() : 'N/A';
          return (
            <KPIWidget
              key={kpi.id}
              title={kpi.name}
              value={`${value} ${kpi.unit || ''}`}
              change={kpiStats[kpi.slug]?.change || 0}
              changeType={(kpiStats[kpi.slug]?.change || 0) >= 0 ? 'positive' : 'negative'}
              onClick={() => navigate(`/kpis/${kpi.id}/detail`)}
            />
          );
        })}
      </div>

      {/* Charts (show 2 most relevant KPIs with history) */}
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
            <Card key={kpi.id} title={kpi.name} subtitle="Recent performance">
              <LineChart data={chartData} height={300} showLegend={false} />
            </Card>
          );
        })}
      </div>

      {/* System Status (keep as in your version) */}
      <Card title="System Status" subtitle="Current system health and performance">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">98%</div>
            <div className="text-sm text-green-700">System Uptime</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">1.2s</div>
            <div className="text-sm text-blue-700">Avg Response Time</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">24/7</div>
            <div className="text-sm text-purple-700">Monitoring Active</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OverviewPage;
