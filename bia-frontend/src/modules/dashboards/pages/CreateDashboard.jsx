import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { createDashboard } from "../../../api/dashboardsApi";
import { toast } from "react-toastify";

const CreateDashboard = () => {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        name: data.name,
        description: data.description,
        user_id: JSON.parse(localStorage.getItem("user"))?.id || 1,
        layout: {
          rows: Number(data.rows) || 2,
          columns: Number(data.columns) || 3,
        },
        filters: {
          module: data.module || "sales",
          date_range: data.date_range || "last_30_days",
          region: data.region || "Addis Ababa",
        },
        is_public: data.is_public === "true",
        is_default: data.is_default === "true",
        refresh_interval: Number(data.refresh_interval) || 600,
      };

      await createDashboard(payload);
      toast.success("Dashboard created successfully!");
      // redirect to dashboard page
      window.location.href = "/dashboards";
      reset();
    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.message || "Failed to create dashboard"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-semibold text-blue-800 mb-6">Create Dashboard</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dashboard Name</label>
          <input
            {...register("name")}
            placeholder="e.g. Sales Overview"
            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            {...register("description")}
            placeholder="Short description about the dashboard"
            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5"
            rows="3"
          />
        </div>

        {/* Layout */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rows</label>
            <input
              type="number"
              {...register("rows")}
              placeholder="Default: 2"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Columns</label>
            <input
              type="number"
              {...register("columns")}
              placeholder="Default: 3"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
            <select
              {...register("module")}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5"
            >
              <option value="sales">Sales</option>
              <option value="finance">Finance</option>
              <option value="supply_chain">Supply Chain</option>
              <option value="hr">HR</option>
              <option value="operations">Operations</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              {...register("date_range")}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5"
            >
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_quarter">Last Quarter</option>
              <option value="year_to_date">Year to Date</option>
              <option value="last_year">Last Year</option>
              <option value="all_time">All Time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <input
              {...register("region")}
              placeholder="Default: Addis Ababa"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5"
            />
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Public</label>
            <select
              {...register("is_public")}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default</label>
            <select
              {...register("is_default")}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>

        {/* Refresh Interval */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Interval (sec)</label>
          <input
            type="number"
            {...register("refresh_interval")}
            placeholder="Default: 600"
            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5"
          />
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
          >
            {loading ? "Creating..." : "Create Dashboard"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateDashboard;
