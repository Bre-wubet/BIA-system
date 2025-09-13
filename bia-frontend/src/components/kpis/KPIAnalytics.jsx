import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const KPIAnalytics = ({ analytics, className = "" }) => {
  const formatValue = (value, format = 'number') => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    } else if (format === 'percentage') {
      return `${value}%`;
    }
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) {
      return <span className="text-green-500 text-lg">↗</span>;
    } else if (trend < 0) {
      return <span className="text-red-500 text-lg">↘</span>;
    }
    return <span className="text-gray-500 text-lg">→</span>;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Performance Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {analytics.total_kpis || 0}
            </div>
            <div className="text-sm text-gray-600">Total KPIs</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              {getTrendIcon(analytics.kpi_growth_trend || 0)}
              <span className={`text-sm ${getTrendColor(analytics.kpi_growth_trend || 0)}`}>
                {analytics.kpi_growth_trend > 0 ? '+' : ''}{analytics.kpi_growth_trend || 0}%
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {analytics.on_target_kpis || 0}
            </div>
            <div className="text-sm text-gray-600">On Target</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Badge variant="success" size="sm">
                {analytics.on_target_percentage || 0}%
              </Badge>
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-1">
              {analytics.off_target_kpis || 0}
            </div>
            <div className="text-sm text-gray-600">Off Target</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Badge variant="danger" size="sm">
                {analytics.off_target_percentage || 0}%
              </Badge>
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-1">
              {analytics.inactive_kpis || 0}
            </div>
            <div className="text-sm text-gray-600">Inactive</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Badge variant="warning" size="sm">
                {analytics.inactive_percentage || 0}%
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Category Performance */}
      {analytics.category_performance && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
          <div className="space-y-4">
            {analytics.category_performance.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {category.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {category.on_target}/{category.total} KPIs
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(category.on_target / category.total) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {Math.round((category.on_target / category.total) * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Performance Trends */}
      {analytics.performance_trends && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatValue(analytics.performance_trends.average_performance, 'percentage')}
              </div>
              <div className="text-sm text-gray-600">Average Performance</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                {getTrendIcon(analytics.performance_trends.performance_change || 0)}
                <span className={`text-sm ${getTrendColor(analytics.performance_trends.performance_change || 0)}`}>
                  {analytics.performance_trends.performance_change > 0 ? '+' : ''}{analytics.performance_trends.performance_change || 0}%
                </span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {analytics.performance_trends.improved_kpis || 0}
              </div>
              <div className="text-sm text-gray-600">Improved KPIs</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-green-500 text-sm">↗</span>
                <span className="text-sm text-green-600">
                  +{analytics.performance_trends.improvement_rate || 0}%
                </span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {analytics.performance_trends.declined_kpis || 0}
              </div>
              <div className="text-sm text-gray-600">Declined KPIs</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-red-500 text-sm">↘</span>
                <span className="text-sm text-red-600">
                  {analytics.performance_trends.decline_rate || 0}%
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      {analytics.recent_activity && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analytics.recent_activity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'improvement' ? 'bg-green-500' :
                    activity.type === 'decline' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-900">
                    {activity.description}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Badge 
                    variant={
                      activity.type === 'improvement' ? 'success' :
                      activity.type === 'decline' ? 'danger' : 'info'
                    }
                    size="sm"
                  >
                    {activity.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default KPIAnalytics;
