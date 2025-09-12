// src/pages/KpiViewDetails.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getKPIById, getKPIValuesHistory } from "../../../api/kpisApi";
import { format } from 'date-fns';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { MdRefresh, MdLoop } from "react-icons/md";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function KpiViewDetails() {
  const { id } = useParams();
  const [kpi, setKpi] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const kpiRes = await getKPIById(id);
      const historyRes = await getKPIValuesHistory(id, 50);

      setKpi(kpiRes.data || []);
      setHistory(historyRes);
      setError(null);
    } catch (err) {
      console.error("Error fetching KPI:", err);
      setError("Failed to load KPI details.");
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <MdLoop className="animate-spin w-6 h-6 mr-2" /> Loading KPI details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded">
        {error}
        <Button onClick={fetchData} className="ml-3">
          Retry
        </Button>
      </div>
    );
  }

  if (!kpi) return null;

  return (
    <div className="space-y-6">
      {/* KPI Info */}
      <Card>
          <h2 className="text-xl font-semibold">{kpi.name}</h2>
          <p className="text-gray-600">{kpi.description}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">Type: {kpi.type}</span>
            {history.length > 0 && (
              <span className="text-lg font-bold text-green-700">
                Latest: {formatNumber(history[0].value)}
              </span>
            )}
          </div>
      

            {/* KPI Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                <span className="text-gray-500">Category:</span>{' '}
                <span className="ml-2 font-medium">
                    {kpi.category || 'N/A'}
                </span>
                </div>
                <div>
                <span className="text-gray-500">Unit:</span>{' '}
                <span className="ml-2 font-medium">{kpi.unit || 'N/A'}</span>
                </div>
                <div>
                <span className="text-gray-500">Target:</span>{' '}
                <span className="ml-2 font-medium">
                    {kpi.target_value || 'N/A'}
                </span>
                </div>
                <div>
                <span className="text-gray-500">Refresh:</span>{' '}
                <span className="ml-2 font-medium">
                    {kpi.refresh_frequency || 'Custom'}
                </span>
                </div>
                <div>
                <span className="text-sm text-gray-500">
                    Formula: {kpi.formula}
                </span>
                </div>
                <div>
                <span className="text-sm text-gray-500">
                    Last Updated:{' '}
                    {kpi.updated_at
                    ? format(new Date(kpi.updated_at), 'MM/dd/yyyy')
                    : 'Never'}
                </span>
                </div>
            </div>
      </Card>
      {/* Chart */}
      <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-lg">History (last 50 values)</h3>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <MdRefresh className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
          {history.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[...history].reverse()} // ensure chronological order
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="calculated_at"
                  tickFormatter={formatDate}
                  minTickGap={20}
                />
                <YAxis tickFormatter={formatNumber} />
                <Tooltip
                  formatter={(val) => formatNumber(val)}
                  labelFormatter={(date) => formatDate(date)}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No history data available</p>
          )}
      </Card>

      {/* Table */}
      <Card>
          <h3 className="font-medium text-lg mb-4">History Table</h3>
          {history.length > 0 ? (
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 p-2 text-left">
                    Date
                  </th>
                  <th className="border border-gray-200 p-2 text-left">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, i) => (
                  <tr key={i}>
                    <td className="border border-gray-200 p-2">
                      {formatDate(item.calculated_at)}
                    </td>
                    <td className="border border-gray-200 p-2">
                      {formatNumber(item.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No history data available</p>
          )}
      </Card>
    </div>
  );
}
