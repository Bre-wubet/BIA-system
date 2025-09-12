import React from "react";
import { MdTrendingUp, MdTrendingDown, MdRemove } from "react-icons/md";
import { CHART_COLORS } from "../../constants/chartConfig";

// Utility: format large numbers with commas
const formatValue = (val) => {
  if (val === null || val === undefined) return "N/A";
  if (typeof val === "number") return val.toLocaleString();
  return val;
};

const KPIWidget = ({
  title,
  value,
  unit = "",
  change,
  changeType = "neutral", // positive | negative | neutral
  trend,
  icon,
  size = "md",
  className = "",
}) => {
  const sizes = {
    sm: "p-3 text-sm",
    md: "p-4 text-base",
    lg: "p-6 text-lg",
  };

  const getChangeStyle = (type) => {
    switch (type) {
      case "positive":
        return { color: "text-green-600", Icon: MdTrendingUp, bg: "bg-green-50" };
      case "negative":
        return { color: "text-red-600", Icon: MdTrendingDown, bg: "bg-red-50" };
      default:
        return { color: "text-gray-600", Icon: MdRemove, bg: "bg-gray-50" };
    }
  };

  const { color, Icon, bg } = getChangeStyle(changeType);

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${sizes[size]} ${className}`}
      aria-label={`KPI Widget for ${title}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Title + Value */}
          <div className="flex items-center space-x-3">
            {icon && <div className="p-2 bg-blue-100 rounded-lg">{icon}</div>}
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <div className="flex items-baseline space-x-2">
                <p className="font-semibold text-gray-900">
                  {formatValue(value)}
                  {unit && <span className="ml-1 text-gray-500 text-sm">{unit}</span>}
                </p>

                {/* Change Indicator */}
                {typeof change === "number" && (
                  <div className={`flex items-center space-x-1 ${color}`}>
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">
                      {change > 0 ? "+" : ""}
                      {change}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Optional Trend */}
          {trend && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Trend</span>
                <span className="font-medium text-gray-900">{trend}</span>
              </div>
            </div>
          )}
        </div>

        {/* Background Accent Bubble */}
        {changeType !== "neutral" && (
          <div className={`hidden md:flex w-10 h-10 items-center justify-center rounded-full ${bg}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default KPIWidget;
