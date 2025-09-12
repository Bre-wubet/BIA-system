import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createWidget } from "../../../api/widgetsApi"; // your axios call
import { getAllDashboards } from "../../../api/dashboardsApi"; // fetch dashboards for dropdown
import { getAllKPIs } from "../../../api/kpisApi"; // optional if you want to list KPIs
import { getAllDataSources } from "../../../api/integrationApi"; // optional
import { toast } from "react-toastify";

const CreateWidget = () => {
  const { register, handleSubmit, reset, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [dashboards, setDashboards] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [dataSources, setDataSources] = useState([]);

  const watchType = watch("type");
  const watchSourceChoice = watch("sourceChoice");

useEffect(() => {
  const fetchData = async () => {
    try {
      const [dbRes, kpiRes, dsRes] = await Promise.all([
        getAllDashboards(),
        getAllKPIs(),
        getAllDataSources()
      ]);

      // normalize each response into an array
      setDashboards(
        Array.isArray(dbRes) ? dbRes : dbRes?.data || []
      );
      setKpis(
        Array.isArray(kpiRes) ? kpiRes : kpiRes?.data || []
      );
      setDataSources(
        Array.isArray(dsRes) ? dsRes : dsRes?.data || []
      );
    } catch (err) {
      console.error("Error loading dropdown data", err);
      setDashboards([]); 
      setKpis([]); 
      setDataSources([]); // fallback to empty arrays
    }
  };
  fetchData();
}, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Build payload
      const payload = {
        dashboard_id: Number(data.dashboard_id),
        type: data.type,
        title: data.title,
        kpi_id: data.sourceChoice === "kpi" ? Number(data.kpi_id) : null,
        data_source_id: data.sourceChoice === "dataSource" ? Number(data.data_source_id) : null,
        config: data.config ? JSON.parse(data.config) : {},
        position: {
          x: Number(data.x) || 0,
          y: Number(data.y) || 0,
          w: Number(data.w) || 1,
          h: Number(data.h) || 1,
        },
      };

      await createWidget(payload);
      toast.success("Widget created successfully!");
      reset();
    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.message || "Failed to create widget"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Create Widget</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Dashboard Selection */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Dashboard</label>
          <select {...register("dashboard_id")} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500">
            {dashboards.map((db) => (
              <option key={db.id} value={db.id}>{db.name}</option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Type</label>
          <select {...register("type")} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500">
            <option value="kpi">KPI</option>
            <option value="chart">Chart</option>
            <option value="table">Table</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Title</label>
          <input
            {...register("title")}
            placeholder="Widget Title"
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Source choice */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Data Source Type</label>
          <select {...register("sourceChoice")} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500">
            <option value="kpi">KPI</option>
            <option value="dataSource">Data Source</option>
          </select>
        </div>

        {/* KPI Dropdown */}
        {watchSourceChoice === "kpi" && (
          <div>
            <label className="block font-medium text-gray-700 mb-1">Select KPI</label>
            <select {...register("kpi_id")} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500">
              {kpis.map((kpi) => (
                <option key={kpi.id} value={kpi.id}>{kpi.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* DataSource Dropdown */}
        {watchSourceChoice === "dataSource" && (
          <div>
            <label className="block font-medium text-gray-700 mb-1">Select Data Source</label>
            <select {...register("data_source_id")} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500">
              {dataSources.map((ds) => (
                <option key={ds.id} value={ds.id}>{ds.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Config JSON */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Config (JSON)</label>
          <textarea
            {...register("config")}
            placeholder='{"chartType": "bar", "color": "blue"}'
            rows={4}
            className="w-full border rounded-lg p-2 font-mono focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Positioning */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input type="number" {...register("x")} placeholder="X" className="border rounded-lg p-2" />
          <input type="number" {...register("y")} placeholder="Y" className="border rounded-lg p-2" />
          <input type="number" {...register("w")} placeholder="Width" className="border rounded-lg p-2" />
          <input type="number" {...register("h")} placeholder="Height" className="border rounded-lg p-2" />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Widget"}
        </button>
      </form>
    </div>
  );
};

export default CreateWidget;
