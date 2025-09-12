import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {createKPI} from "../../../api/kpisApi";
import { getAllDashboards } from "../../../api/dashboardsApi";
import * as integrationApi from "../../../api/integrationApi";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";

const CreateNewKPI = () => {
  const navigate = useNavigate();

  // --- Form State ---
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    formula: "",
    type: "",
    unit: "",
    target_value: 1,
    refresh_frequency: 3600,
    dashboard_id: 1,
    created_by: 1, // TODO: replace with logged-in user ID from context/auth
  });

  // --- UI State ---
  const [dashboards, setDashboards] = useState([]);
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successModal, setSuccessModal] = useState(false);

  // --- Load available Data Sources ---
useEffect(() => {
  const fetchData = async () => {
    try {
      const [dbRes, dsRes] = await Promise.all([
        getAllDashboards(),
        integrationApi.getAllDataSources()
      ]);

      // normalize each response into an array
      setDashboards(
        Array.isArray(dbRes) ? dbRes : dbRes?.data || []
      );
      setDataSources(
        Array.isArray(dsRes) ? dsRes : dsRes?.data || []
      );
    } catch (err) {
      console.error("Error loading dropdown data", err);
      setDashboards([]); 
      setDataSources([]); // fallback to empty arrays
    }
  };
  fetchData();
}, []);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
    const payload = {
      ...formData,
      target_value: Number(formData.target_value),
      refresh_frequency: Number(formData.refresh_frequency),
      dashboard_id: Number(formData.dashboard_id)
    };

    await createKPI(payload);
      setSuccessModal(true);
    } catch (err) {
   console.error("Error creating KPI:", err);

  // Normalize error to string
  const message =
    err?.message ||
    err?.error ||
    err?.errors
      ? Object.values(err.errors).join(", ")
      : "Failed to create KPI";
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shadow-sm">
      <Card>
        <h2 className="text-2xl font-bold text-blue-800 mb-6 shadow-sm">Create New KPI</h2>
        {error && (
        <div className="text-red-500 mb-2">
            {typeof error === "string"
            ? error
            : error.message || JSON.stringify(error)}
        </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block font-medium">KPI Name</label>
            <input
              type="text"
              name="name"
              className="w-full border p-2 rounded"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium">Description</label>
            <textarea
              name="description"
              rows="2"
              className="w-full border p-2 rounded"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block font-medium">Category</label>
                <select
                name="category"
                className="w-full border p-2 rounded"
                value={formData.category}
                onChange={handleChange}
                required
                >
                <option value="">Select category</option>
                <option value="finance">Finance</option>
                <option value="sales">Sales</option>
                <option value="supply_chain">Supply Chain</option>
                <option value="hr">HR</option>
                </select>
            </div>

            {/* kpi type */}
            <div>
                <label className="block font-medium">Render Type</label>
                <select
                name="type"
                className="w-full border p-2 rounded"
                value={formData.type}
                onChange={handleChange}
                required
                >
                <option value="">Select render type</option>
                 <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="area">Area</option>
                <option value="table">Table</option>
                <option value="progress">Progress</option>
                <option value="gauge">Gauge</option>
                </select>
            </div>
          </div>
          {/* Formula */}
          <div>
            <label className="block font-medium">Formula</label>
            <textarea
              name="formula"
              rows="3"
              className="w-full border p-2 rounded font-mono"
              value={formData.formula}
              onChange={handleChange}
              required
            />
            <small className="text-gray-500">
              Example: <code>(total_sales / total_orders) * 100</code>
            </small>
            {formData.formula && (
              <p className="mt-1 text-green-600">
                Formula Preview: <code>{formData.formula}</code>
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Unit */}
            <div>
                <label className="block font-medium">Unit</label>
                <input
                type="text"
                name="unit"
                className="w-full border p-2 rounded"
                placeholder="%, $, count, etc."
                value={formData.unit}
                onChange={handleChange}
                />
            </div>

            {/* Target Value */}
            <div>
                <label className="block font-medium">Target Value</label>
                <input
                type="number"
                step="0.01"
                name="target_value"
                className="w-full border p-2 rounded"
                value={formData.target_value}
                onChange={handleChange}
                />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Refresh Frequency */}
            <div>
              <label className="block font-medium">Refresh Frequency (seconds)</label>
              <select
                name="refresh_frequency"
                className="w-full border p-2 rounded"
                value={formData.refresh_frequency}
                onChange={handleChange}
              >
                <option value={3600}>Hourly</option>
                <option value={86400}>Daily</option>
                <option value={604800}>Weekly</option>
              </select>
            </div>
              {/* Dashboard Selection */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">Dashboard</label>
              <select value={formData.dashboard_id}
                  onChange={handleChange} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500">
                {dashboards.map((db) => (
                  <option key={db.id} value={db.id}>{db.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <Button
            variant="primary"
            size="md"
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Creating..." : "Create KPI"}
          </Button>
        </form>
      </Card>

      {/* Success Modal */}
      <Modal isOpen={successModal} onClose={() => navigate("/kpis")}>
        <h3 className="text-lg font-bold">KPI Created</h3>
        <p>Your KPI has been successfully created.</p>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/kpis")}
        >
          Go to KPIs
        </Button>
      </Modal>
    </div>
  );
};

export default CreateNewKPI;
