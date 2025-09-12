import React, { useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { CHART_COLORS, DEFAULT_CHART_OPTIONS } from '../../constants/chartConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({
  data,
  title,
  height = 300,
  showLegend = true,
  showArea = false,
  customOptions = {},
  className = '',
  yAxisLabel = '',
  xAxisLabel = '',
  valuePrefix = '',
  valueSuffix = '',
  colors = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.tertiary],
}) => {
  const chartRef = useRef(null);

  // Generate gradient dynamically
  const generateGradient = (ctx, color) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, `${color}80`); // 50% opacity at top
    gradient.addColorStop(1, `${color}05`); // faded bottom
    return gradient;
  };

  // Default data if none provided
  const defaultData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Dataset 1',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: colors[0],
        backgroundColor: showArea ? `${colors[0]}20` : 'transparent',
        borderWidth: 2,
        fill: showArea,
        tension: 0.4,
        pointBackgroundColor: colors[0],
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartData = data && Array.isArray(data.datasets) 
  ? data 
  : defaultData;

  // Apply gradient background if showArea
  useEffect(() => {
    if (!showArea || !chartRef.current) return;
    const chart = chartRef.current;
    const ctx = chart.ctx;
    chartData.datasets.forEach((dataset, idx) => {
      dataset.backgroundColor = generateGradient(ctx, colors[idx % colors.length]);
    });
  }, [chartData, showArea, colors]);

  const options = {
    ...DEFAULT_CHART_OPTIONS,
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
    plugins: {
      ...DEFAULT_CHART_OPTIONS.plugins,
      title: {
        display: !!title,
        text: title,
        font: {
          size: 18,
          weight: 'bold',
        },
        padding: { bottom: 20 },
      },
      legend: {
        display: showLegend,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function (ctx) {
            let val = ctx.parsed.y;
            return ` ${ctx.dataset.label}: ${valuePrefix}${val.toLocaleString()}${valueSuffix}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'category',
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: !!xAxisLabel,
          text: xAxisLabel,
          font: { size: 14, weight: '500' },
        },
        ticks: {
          maxRotation: 45,
          minRotation: 30,
          autoSkip: true,
          maxTicksLimit: 8,
          color: '#6B7280',
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
          font: { size: 14, weight: '500' },
        },
        ticks: {
          color: '#6B7280',
          callback: function (value) {
            return `${valuePrefix}${value.toLocaleString()}${valueSuffix}`;
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    elements: {
      point: {
        hoverRadius: 6,
      },
    },
    ...customOptions,
  };

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default LineChart;
