import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Analytics page component that displays various data visualization components
 * @returns {React.ReactNode} - Analytics page with charts and filters
 */
const Analytics = () => {
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = useState('month');
  const [dataSource, setDataSource] = useState('all');

  // Mock data for charts
  const generateMockData = (range) => {
    const data = [];
    const points = range === 'week' ? 7 : range === 'month' ? 30 : 12;
    
    for (let i = 0; i < points; i++) {
      data.push({
        label: i.toString(),
        value: Math.floor(Math.random() * 1000) + 500,
        secondaryValue: Math.floor(Math.random() * 800) + 200,
      });
    }
    
    return data;
  };

  const chartData = generateMockData(timeRange);

  // Calculate totals and averages
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
  const totalSecondary = chartData.reduce((sum, item) => sum + item.secondaryValue, 0);
  const avgValue = Math.round(totalValue / chartData.length);
  const avgSecondary = Math.round(totalSecondary / chartData.length);

  // Generate chart points
  const maxValue = Math.max(...chartData.map(item => Math.max(item.value, item.secondaryValue)));
  const chartHeight = 200;
  const chartWidth = chartData.length * 30;

  const getYPosition = (value) => {
    return chartHeight - (value / maxValue) * chartHeight;
  };

  // Generate line paths
  const generateLinePath = (data, valueKey) => {
    return data.map((item, index) => {
      const x = index * (chartWidth / (data.length - 1));
      const y = getYPosition(item[valueKey]);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const primaryLinePath = generateLinePath(chartData, 'value');
  const secondaryLinePath = generateLinePath(chartData, 'secondaryValue');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Analytics Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Analyze your business performance metrics</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center">
          <label className="mr-2 text-gray-700 dark:text-gray-300">Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded p-2 bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
        <div className="flex items-center">
          <label className="mr-2 text-gray-700 dark:text-gray-300">Data Source:</label>
          <select
            value={dataSource}
            onChange={(e) => setDataSource(e.target.value)}
            className="border rounded p-2 bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All Sources</option>
            <option value="web">Web Platform</option>
            <option value="mobile">Mobile App</option>
            <option value="api">API Integrations</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">${totalValue.toLocaleString()}</p>
          <div className="text-green-500 text-sm mt-1">↑ 12% from previous period</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Costs</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">${totalSecondary.toLocaleString()}</p>
          <div className="text-red-500 text-sm mt-1">↑ 5% from previous period</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Average Revenue</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">${avgValue.toLocaleString()}</p>
          <div className="text-green-500 text-sm mt-1">↑ 8% from previous period</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Average Costs</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">${avgSecondary.toLocaleString()}</p>
          <div className="text-gray-500 text-sm mt-1">No change from previous period</div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue vs. Costs</h3>
        <div className="relative" style={{ height: `${chartHeight}px`, width: '100%', overflowX: 'auto' }}>
          <div style={{ width: `${Math.max(chartWidth, 100)}%`, height: '100%', minWidth: '100%' }}>
            <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = chartHeight * ratio;
                return (
                  <g key={ratio}>
                    <line
                      x1="0"
                      y1={y}
                      x2={chartWidth}
                      y2={y}
                      stroke={isDark ? '#374151' : '#e5e7eb'}
                      strokeWidth="1"
                    />
                    <text
                      x="5"
                      y={y - 5}
                      fontSize="10"
                      fill={isDark ? '#9ca3af' : '#6b7280'}
                    >
                      ${Math.round(maxValue * (1 - ratio)).toLocaleString()}
                    </text>
                  </g>
                );
              })}

              {/* X-axis labels */}
              {timeRange === 'week' && (
                ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                  const x = index * (chartWidth / 6);
                  return (
                    <text
                      key={day}
                      x={x}
                      y={chartHeight + 15}
                      fontSize="10"
                      textAnchor="middle"
                      fill={isDark ? '#9ca3af' : '#6b7280'}
                    >
                      {day}
                    </text>
                  );
                })
              )}

              {/* Chart lines */}
              <path
                d={primaryLinePath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              <path
                d={secondaryLinePath}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
              />

              {/* Data points */}
              {chartData.map((item, index) => {
                const x = index * (chartWidth / (chartData.length - 1));
                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={getYPosition(item.value)}
                      r="4"
                      fill="#3b82f6"
                    />
                    <circle
                      cx={x}
                      cy={getYPosition(item.secondaryValue)}
                      r="4"
                      fill="#ef4444"
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
        <div className="flex justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Costs</span>
          </div>
        </div>
      </div>

      {/* Additional metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Performing Products</h3>
          <div className="space-y-4">
            {[
              { name: 'Product A', value: 35 },
              { name: 'Product B', value: 25 },
              { name: 'Product C', value: 20 },
              { name: 'Product D', value: 15 },
              { name: 'Product E', value: 5 },
            ].map((product) => (
              <div key={product.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{product.name}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{product.value}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${product.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue by Channel</h3>
          <div className="relative" style={{ height: '250px' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              {/* Simple pie chart */}
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e5e7eb" strokeWidth="20" />
              
              {/* Pie segments */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#3b82f6"
                strokeWidth="20"
                strokeDasharray="251.2 0"
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="20"
                strokeDasharray="75.36 175.84"
                strokeDashoffset="0"
                transform="rotate(-90 50 50)"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth="20"
                strokeDasharray="50.24 201.0"
                strokeDashoffset="-75.36"
                transform="rotate(-90 50 50)"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#ef4444"
                strokeWidth="20"
                strokeDasharray="25.12 226.08"
                strokeDashoffset="-125.6"
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Online Store (40%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Marketplace (30%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Retail Partners (20%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Direct Sales (10%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;