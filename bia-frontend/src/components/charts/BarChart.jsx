import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { CHART_COLORS, DEFAULT_CHART_OPTIONS } from "../../constants/chartConfig";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({
  data,
  title,
  height = 300,
  showLegend = true,
  customOptions = {},
  className = "",
  stacked = false,
  maxBarThickness = 50,
  emptyMessage = "No data available",
}) => {
  // --- Build chart data with fallbacks ---
  const chartData = useMemo(() => {
    if (!data?.datasets?.length || !data?.labels?.length) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Auto-assign colors if missing
    const colors = Object.values(CHART_COLORS);
    return {
      ...data,
      datasets: data.datasets.map((ds, idx) => ({
        backgroundColor: ds.backgroundColor || colors[idx % colors.length],
        borderColor: ds.borderColor || colors[idx % colors.length],
        borderWidth: ds.borderWidth ?? 1,
        maxBarThickness,
        ...ds,
      })),
    };
  }, [data, maxBarThickness]);

  // --- Chart Options ---
  const options = useMemo(
    () => ({
      ...DEFAULT_CHART_OPTIONS,
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        ...DEFAULT_CHART_OPTIONS.plugins,
        title: {
          display: !!title,
          text: title,
          font: {
            size: 16,
            weight: "bold",
          },
          padding: { top: 10, bottom: 20 },
        },
        legend: {
          display: showLegend,
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function (context) {
              let value = context.raw;
              return `${context.dataset.label}: ${value.toLocaleString()}`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked,
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            color: "#374151",
          },
        },
        y: {
          stacked,
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            color: "#374151",
            callback: function (value) {
              return value.toLocaleString();
            },
          },
        },
      },
      animation: {
        duration: 700,
        easing: "easeOutQuart",
      },
      ...customOptions,
    }),
    [title, showLegend, stacked, customOptions]
  );

  // --- Empty State ---
  if (!data?.datasets?.length || !data?.labels?.length) {
    return (
      <div
        className={`flex items-center justify-center text-gray-400 text-sm italic bg-gray-50 rounded-md ${className}`}
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
