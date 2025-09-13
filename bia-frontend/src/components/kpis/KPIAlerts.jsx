import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';

const KPIAlerts = ({ alerts, onDismiss, onViewKPI, className = "" }) => {
  const getAlertIcon = (severity) => {
    const icons = {
      critical: (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      warning: (
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      info: (
        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    };
    return icons[severity] || icons.info;
  };

  const getSeverityBadge = (severity) => {
    const variants = {
      critical: 'danger',
      warning: 'warning',
      info: 'info'
    };
    return <Badge variant={variants[severity] || 'info'} size="sm">{severity}</Badge>;
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - alertTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!alerts || alerts.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Alerts</h3>
          <p className="text-gray-500">All KPIs are performing within expected ranges.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">KPI Alerts</h3>
        <Badge variant="info" size="sm">
          {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <Alert
            key={index}
            type={alert.severity === 'critical' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'}
            icon={getAlertIcon(alert.severity)}
            onClose={() => onDismiss && onDismiss(alert.id)}
            className="border-l-4 border-l-red-500"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {alert.kpi_name}
                  </h4>
                  {getSeverityBadge(alert.severity)}
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  {alert.message}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Current: {alert.current_value}</span>
                  <span>Target: {alert.target_value}</span>
                  <span>{getTimeAgo(alert.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onViewKPI && onViewKPI(alert.kpi_id)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View KPI
                </button>
              </div>
            </div>
          </Alert>
        ))}
      </div>

      {alerts.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All Alerts ({alerts.length})
          </button>
        </div>
      )}
    </Card>
  );
};

export default KPIAlerts;
