import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getDashboardById, updateDashboard } from "../../../api/dashboardsApi";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const EditDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await getDashboardById(id);
        if (res.data) {
          setDashboard(res.data);

          // Prefill form with API values
          setValue("name", res.data.name);
          setValue("description", res.data.description);
          setValue("rows", res.data.layout?.rows);
          setValue("columns", res.data.layout?.columns);
          setValue("date_range", res.data.filters?.date_range);
          setValue("region", res.data.filters?.region);
          setValue("is_public", String(res.data.is_public));
          setValue("is_default", String(res.data.is_default));
          setValue("refresh_interval", res.data.refresh_interval);

          // JSON text editors
          setValue("layoutJson", JSON.stringify(res.data.layout, null, 2));
          setValue("filtersJson", JSON.stringify(res.data.filters, null, 2));
        }
      } catch (err) {
        toast.error("Failed to load dashboard");
      } finally {
        setFetching(false);
      }
    }
    fetchDashboard();
  }, [id, setValue]);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      // Parse JSON safely
      let parsedLayout = null;
      let parsedFilters = null;
      try {
        parsedLayout = formData.layoutJson ? JSON.parse(formData.layoutJson) : null;
      } catch {
        toast.error("Invalid JSON in Layout");
        setLoading(false);
        return;
      }
      try {
        parsedFilters = formData.filtersJson ? JSON.parse(formData.filtersJson) : null;
      } catch {
        toast.error("Invalid JSON in Filters");
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        layout: parsedLayout,
        filters: parsedFilters,
        is_public: formData.is_public === "true",
        is_default: formData.is_default === "true",
        refresh_interval: Number(formData.refresh_interval) || 600,
      };

      await updateDashboard(id, payload);
      toast.success("Dashboard updated successfully!");
      navigate("/dashboards");
    } catch (err) {
      toast.error(`Error: ${err.message || "Update failed"}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-semibold text-green-800 mb-6">
        Edit Dashboard – <span className="text-indigo-600">{dashboard?.name}</span>
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dashboard Name</label>
          <input
            {...register("name")}
            defaultValue={dashboard?.name}
            className="w-full rounded-lg border-blue-500 shadow-md focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5"
          />
          <p className="text-xs text-gray-500 mt-1">Current: {dashboard?.name}</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            {...register("description")}
            defaultValue={dashboard?.description}
            rows="3"
            className="w-full rounded-lg border-blue-500 shadow-md focus:ring-indigo-500 text-sm p-2.5"
          />
          <p className="text-xs text-gray-500 mt-1">Current: {dashboard?.description}</p>
        </div>

        {/* Layout numbers */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rows</label>
            <input
              type="number"
              {...register("rows")}
              defaultValue={dashboard?.layout?.rows}
              className="w-full rounded-lg border-blue-500 shadow-md focus:ring-indigo-500 text-sm p-2.5"
            />
            <p className="text-xs text-gray-500 mt-1">Current: {dashboard?.layout?.rows}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Columns</label>
            <input
              type="number"
              {...register("columns")}
              defaultValue={dashboard?.layout?.columns}
              className="w-full rounded-lg border-blue-500 shadow-md focus:ring-indigo-500 text-sm p-2.5"
            />
            <p className="text-xs text-gray-500 mt-1">Current: {dashboard?.layout?.columns}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              {...register("date_range")}
              defaultValue={dashboard?.filters?.date_range}
              className="w-full rounded-lg border-blue-500 shadow-md focus:ring-indigo-500 text-sm p-2.5"
            >
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_quarter">Last Quarter</option>
              <option value="year_to_date">Year to Date</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Current: {dashboard?.filters?.date_range}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <input
              {...register("region")}
              defaultValue={dashboard?.filters?.region}
              className="w-full rounded-lg border-blue-500 shadow-md focus:ring-indigo-500 text-sm p-2.5"
            />
            <p className="text-xs text-gray-500 mt-1">Current: {dashboard?.filters?.region}</p>
          </div>
        </div>

        {/* JSON Editors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Layout (JSON)</label>
          <textarea
            {...register("layoutJson")}
            defaultValue={JSON.stringify(dashboard?.layout, null, 2)}
            rows="6"
            className="w-full font-mono rounded-lg border-blue-500 shadow-md focus:ring-indigo-500 text-xs p-2.5"
          />
          <pre className="text-xs bg-gray-50 p-3 mt-2 rounded-lg overflow-x-auto border">
            {JSON.stringify(dashboard?.layout, null, 2)}
          </pre>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filters (JSON)</label>
          <textarea
            {...register("filtersJson")}
            defaultValue={JSON.stringify(dashboard?.filters, null, 2)}
            rows="4"
            className="w-full font-mono rounded-lg border-blue-500 shadow-md focus:ring-indigo-500 text-xs p-2.5"
          />
          <pre className="text-xs bg-gray-50 p-3 mt-2 rounded-lg overflow-x-auto border">
            {JSON.stringify(dashboard?.filters, null, 2)}
          </pre>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Public</label>
            <select
              {...register("is_public")}
              defaultValue={String(dashboard?.is_public)}
              className="w-full rounded-lg border-blue-500 shadow-md focus:ring-indigo-500 text-sm p-2.5"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Current: {dashboard?.is_public ? "Yes" : "No"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default</label>
            <select
              {...register("is_default")}
              defaultValue={String(dashboard?.is_default)}
              className="w-full rounded-lg border-blue-500 shadow-md focus:ring-indigo-500 text-sm p-2.5"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Current: {dashboard?.is_default ? "Yes" : "No"}</p>
          </div>
        </div>

        {/* Refresh */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Interval (sec)</label>
          <input
            type="number"
            {...register("refresh_interval")}
            defaultValue={dashboard?.refresh_interval}
            className="w-full rounded-lg border-blue-500 shadow-md focus:ring-indigo-500 text-sm p-2.5"
          />
          <p className="text-xs text-gray-500 mt-1">Current: {dashboard?.refresh_interval} sec</p>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/dashboards")}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
          >
            {loading ? "Updating..." : "Update Dashboard"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDashboard;
