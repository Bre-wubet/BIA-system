import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import * as integrationApi from "../../../api/integrationApi";
import Button from "../../../components/ui/Button";
const DataSourceSyncHistory = ({ dataSourceId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  useEffect(() => {
    if (!dataSourceId) return;

    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await integrationApi.getDataSyncHistoryByDataSourceId(
          dataSourceId
        );
        setLogs(response.data || []);
      } catch (err) {
        console.error("Error fetching sync history:", err);
        setError("Failed to load sync history.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [dataSourceId]);

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    return new Date(dateTimeString).toLocaleString();
  };

  const formatDuration = (seconds = 0) => {
    if (seconds < 60) return `${seconds} sec`;
    return `${Math.floor(seconds / 60)} min ${seconds % 60} sec`;
  };

  const getStatusBadgeClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "queued":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading sync history...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (logs.length === 0) {
    return <p className="text-gray-500">No synchronization history available.</p>;
  }

  return (
    <div>
        <div className="flex space-x-2 mr-0">
            <button
                onClick={() => navigate("/integration/sync-history")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center"
                variant="outline"
            >
                All Sync History
            </button>
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Started
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Completed
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Records
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
                </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
                <tr key={log.id}>
                <td className="px-4 py-2 whitespace-nowrap">
                    <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                        log.status
                    )}`}
                    >
                    {log.status}
                    </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(log.run_timestamp)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(log.created_at)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {formatDuration(log.duration_seconds)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {log.record_count !== undefined ? log.record_count : "N/A"}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    <button
                    onClick={() =>
                        alert(log.message || "No additional details available")
                    }
                    className="text-blue-600 hover:text-blue-900"
                    >
                    View
                    </button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
  );
};

export default DataSourceSyncHistory;
