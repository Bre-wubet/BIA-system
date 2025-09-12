import React from "react";
import BarChart from "../components/charts/BarChart";
import LineChart from "../components/charts/LineChart";
import KPIWidget from "../components/charts/KPIWidget";

// --- Chart Registry (easy to extend) ---
const chartRegistry = {
  bar: (widget, data) => (
    <BarChart
      data={data?.chartData || []}
      title={widget.title}
      height={widget.config?.height || 250}
      showLegend={widget.config?.showLegend ?? true}
    />
  ),
  line: (widget, data) => (
    <LineChart
      data={data?.chartData || []}
      title={widget.title}
      height={widget.config?.height || 250}
      showLegend={widget.config?.showLegend ?? true}
    />
  ),
};

// --- Table Renderer ---
const TableWidget = ({ data }) => {
  if (!data?.rows?.length) {
    return (
      <div className="text-gray-400 text-sm italic p-4">
        No table data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {data?.columns?.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data?.rows?.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-6 py-3 whitespace-nowrap text-gray-900"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Main Renderer ---
export const renderWidgetContent = (widget, data, { loading, error } = {}) => {
  if (loading) {
    return <div className="text-gray-400 p-4">Loading widget...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-sm">
        Failed to load widget: {error}
      </div>
    );
  }

  switch (widget.type) {
    case "chart": {
      const renderer = chartRegistry[widget.config?.chartType];
      return renderer
        ? renderer(widget, data)
        : <div className="text-gray-500">Chart type not supported</div>;
    }

    case "kpi":
      return (
        <KPIWidget
          title={widget.title}
          value={data?.value ?? "N/A"}
          unit={widget.config?.unit || ""}
          change={data?.change}
          changeType={data?.changeType || "neutral"}
          size={widget.config?.size || "sm"}
        />
      );

    case "table":
      return <TableWidget data={data} />;

    default:
      return <div className="text-gray-500">Widget type not supported</div>;
  }
};
