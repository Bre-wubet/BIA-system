import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { FaEye, FaEdit, FaCopy, FaTrash, FaShareAlt, FaDownload } from "react-icons/fa";

import { getWidgetById, deleteWidget, getWidgetData } from "../../../api/widgetsApi";
import { format } from "date-fns";
import { renderWidgetContent } from "../../../utils/widgetRenderer";

export default function WidgetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [widget, setWidget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [widgetData, setWidgetData] = useState(null);

  // Fetch widget metadata
  useEffect(() => {
    if (!id) return;
    const fetchWidget = async () => {
      try {
        const res = await getWidgetById(id);
        setWidget(res);
      } catch (err) {
        console.error("Failed to fetch widget", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWidget();
  }, [id]);

  // Fetch widget data
  useEffect(() => {
    if (!widget?.id) return; // prevent calling undefined
    const fetchData = async () => {
      try {
        const data = await getWidgetData(widget.id);
        setWidgetData(data) ;
      } catch (err) {
        console.error("Failed to fetch widget data", err);
      }
    };
    fetchData();
  }, [widget]);

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this widget?")) {
      try {
        await deleteWidget(id);
        navigate("/widgets");
      } catch (err) {
        console.error("Failed to delete widget", err);
      }
    }
  };

  if (loading) return <p className="p-6">Loading widget...</p>;
  if (!widget) return <p className="p-6 text-red-500">Widget not found.</p>;

  // Safe dates
  const safeDate = widget.updated_at ? new Date(widget.updated_at) : null;
  const safeCreated = widget.created_at ? new Date(widget.created_at) : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{widget.name}</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate(`/widgets/${id}/edit`)}>
            <FaEdit className="w-4 h-4 mr-1" /> Edit
          </Button>

          <Button variant="outline">
            <FaCopy className="w-4 h-4 mr-1" /> Duplicate
          </Button>

          <Button variant="destructive" onClick={handleDelete}>
            <FaTrash className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      {/* Visualization Preview */}
      <Card className="shadow-lg rounded-2xl">
          <h2 className="text-lg font-semibold mb-2">Preview</h2>
          <div className="h-64 flex items-center justify-center border rounded-xl bg-gray-50">
            {/* Replace this with actual chart renderer */}
            {renderWidgetContent(widget, widget.data)}
          </div>
      </Card>

      {/* Widget Info */}
      <Card>
          <h2 className="text-lg font-semibold mb-2">Widget Information</h2>
          <p><strong>Type:</strong> {widget.type}</p>
          <p><strong>Title:</strong> {widget.title}</p>
          <p><strong>Description:</strong> {widget.description }</p>
          <p><strong>Created At:</strong> {safeCreated ? format(safeCreated, "PPpp") : "N/A"}</p>
          <p><strong>Updated At:</strong> {safeDate ? format(safeDate, "PPpp") : "N/A"}</p>
      </Card>

      {/* Actions */}
      <Card className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate(`/widgets/${id}/edit`)}>
              <FaEdit className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <FaTrash className="w-4 h-4 mr-1" /> Delete
            </Button>
          </div>
          <div className="flex items-center">
            <FaEye className="w-10 h-10 text-gray-400" />
            <span className="ml-2 text-gray-500">Chart/Table Preview</span>
          </div>
      </Card>

      {/* Widget Details */}
      <Card>
          <h2 className="text-lg font-semibold">Widget Details</h2>
          <p><strong>Type:</strong> {widget.type}</p>
          <p><strong>Description:</strong> {widget.description }</p>
          <p><strong>Dashboard:</strong> {widget.dashboard?.name }</p>
          <p><strong>KPI:</strong> {widget.kpi?.name }</p>
          <p><strong>Data Source:</strong> {widget.data_source?.name }</p>
          <p><strong>Refresh:</strong> {widget.refresh_frequency }</p>
          <p>
            <strong>Last Updated:</strong>{" "}
            {safeDate ? format(safeDate, "PPpp") : "N/A"}
          </p>
      </Card>

      {/* Config JSON */}
      <Card>
          <h2 className="text-lg font-semibold mb-2">Widget Config</h2>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            {JSON.stringify(widget.config, null, 2)}
          </pre>
      </Card>

      {/* Data Preview */}
      <Card>
          <h2 className="text-lg font-semibold mb-2">Data Preview</h2>
          <div className="overflow-x-auto">
            {widget.sample_data && widget.sample_data.length > 0 ? (
              <table className="w-full border text-sm">
                <thead>
                  <tr>
                    {Object.keys(widget.sample_data[0]).map((col) => (
                      <th key={col} className="border px-3 py-2 bg-gray-100">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {widget.sample_data.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="border px-3 py-2">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No sample data available</p>
            )}
          </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline">
          <FaShareAlt className="w-4 h-4 mr-1" /> Share
        </Button>
        <Button variant="outline">
          <FaDownload className="w-4 h-4 mr-1" /> Export
        </Button>
      </div>
    </div>
  );
}
