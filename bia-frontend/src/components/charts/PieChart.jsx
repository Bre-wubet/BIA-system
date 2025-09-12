// components/charts/PieChart.jsx
import React, { useRef, useEffect, useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { CHART_COLORS, DEFAULT_CHART_OPTIONS } from '../../constants/chartConfig';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

const PieChart = ({
  data,
  title,
  height = 300,
  showLegend = true,
  customOptions = {},
  className = '',
  valuePrefix = '',
  valueSuffix = '',
  showPercentage = false,
  colors = [
    CHART_COLORS.primary,
    CHART_COLORS.secondary,
    CHART_COLORS.tertiary,
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
  ],
}) => {
  const chartRef = useRef(null);

  // Fallback data
  const defaultData = useMemo(() => ({
    labels: ['Category A', 'Category B', 'Category C'],
    datasets: [
      {
        label: 'Default Data',
        data: [40, 30, 30],
        backgroundColor: colors.slice(0, 3),
        borderWidth: 1,
        borderColor: '#fff',
      },
    ],
  }), [colors]);

  // Ensure valid Chart.js data
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data.labels) || !Array.isArray(data.datasets)) {
      return defaultData;
    }

    return {
      ...data,
      datasets: data.datasets.map((ds, idx) => ({
        ...ds,
        backgroundColor:
          ds.backgroundColor ||
          ds.data.map(
            (_, i) => colors[(i + idx) % colors.length] || '#999999'
          ),
      })),
    };
  }, [data, colors, defaultData]);

  // Generate gradient fills
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    const ctx = chart.ctx;

    chartData.datasets.forEach((dataset, idx) => {
      dataset.backgroundColor = dataset.data.map((_, i) => {
        const baseColor = colors[(i + idx) % colors.length] || '#999999';
        if (!ctx || !ctx.createLinearGradient) return baseColor;

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, `${baseColor}E6`);
        gradient.addColorStop(1, `${baseColor}33`);
        return gradient;
      });
    });
  }, [chartData, colors, height]);

  const total = useMemo(() => {
    if (!chartData.datasets?.[0]?.data) return 0;
    return chartData.datasets[0].data.reduce((sum, val) => sum + Number(val), 0);
  }, [chartData]);

  const options = useMemo(() => ({
    ...DEFAULT_CHART_OPTIONS,
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: 'easeOutBounce' },
    plugins: {
      ...DEFAULT_CHART_OPTIONS.plugins,
      title: {
        display: !!title,
        text: title,
        font: { size: 18, weight: 'bold' },
        padding: { bottom: 20 },
      },
      legend: {
        display: showLegend,
        position: 'bottom',
        labels: { usePointStyle: true, padding: 20 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = Number(ctx.parsed) || 0;
            if (showPercentage && total > 0) {
              const percent = ((val / total) * 100).toFixed(2);
              return ` ${ctx.label}: ${valuePrefix}${val.toLocaleString()}${valueSuffix} (${percent}%)`;
            }
            return ` ${ctx.label}: ${valuePrefix}${val.toLocaleString()}${valueSuffix}`;
          },
        },
      },
    },
    ...customOptions,
  }), [title, showLegend, valuePrefix, valueSuffix, customOptions, showPercentage, total]);

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Pie ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default PieChart;
