import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';

const KPIWidget = ({ 
  kpi, 
  onEdit, 
  onDelete, 
  onViewDetails,
  className = ""
}) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      'on_target': { variant: 'success', label: 'On Target' },
      'off_target': { variant: 'danger', label: 'Off Target' },
      'inactive': { variant: 'warning', label: 'Inactive' }
    };
    
    const config = statusConfig[status] || statusConfig['inactive'];
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) {
      return <span className="text-green-500">↗</span>;
    } else if (trend < 0) {
      return <span className="text-red-500">↘</span>;
    }
    return <span className="text-gray-500">→</span>;
  };

  const formatValue = (value, format) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    } else if (format === 'percentage') {
      return `${value}%`;
    } else if (format === 'number') {
      return new Intl.NumberFormat('en-US').format(value);
    }
    return value;
  };

  return (
    <Card className={`p-6 hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {kpi.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {kpi.description}
          </p>
          <div className="flex items-center gap-2">
            {getStatusBadge(kpi.status)}
            <Badge variant="info" size="sm">
              {kpi.category}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip content="Edit KPI">
            <button
              onClick={() => onEdit(kpi.id)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </Tooltip>
          <Tooltip content="View Details">
            <button
              onClick={() => onViewDetails(kpi.id)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </Tooltip>
          <Tooltip content="Delete KPI">
            <button
              onClick={() => onDelete(kpi.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Current Value</span>
          <span className="text-2xl font-bold text-gray-900">
            {formatValue(kpi.current_value, kpi.format)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Target</span>
          <span className="text-lg font-semibold text-gray-700">
            {formatValue(kpi.target_value, kpi.format)}
          </span>
        </div>

        {kpi.trend !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Trend</span>
            <div className="flex items-center gap-2">
              {getTrendIcon(kpi.trend)}
              <span className="text-sm font-medium">
                {kpi.trend > 0 ? '+' : ''}{kpi.trend}%
              </span>
            </div>
          </div>
        )}

        {kpi.performance_ratio && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Performance</span>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    kpi.performance_ratio >= 0.8 ? 'bg-green-500' : 
                    kpi.performance_ratio >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(kpi.performance_ratio * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {Math.round(kpi.performance_ratio * 100)}%
              </span>
            </div>
          </div>
        )}

        {kpi.predictive_value && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Predicted</span>
            <span className="text-sm font-medium text-blue-600">
              {formatValue(kpi.predictive_value, kpi.format)}
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Last updated: {new Date(kpi.updated_at).toLocaleDateString()}</span>
            <span>Frequency: {kpi.frequency}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default KPIWidget;
