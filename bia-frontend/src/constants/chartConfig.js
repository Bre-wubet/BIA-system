export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  warning: '#F97316',
  info: '#06B6D4',
  success: '#22C55E',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  darkGray: '#374151'
};

export const CHART_TYPES = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
  DOUGHNUT: 'doughnut',
  AREA: 'area',
  SCATTER: 'scatter',
  RADAR: 'radar',
  POLAR_AREA: 'polarArea',
  BUBBLE: 'bubble',
  TABLE: 'table',
  KPI: 'kpi',
  GAUGE: 'gauge',
  FUNNEL: 'funnel'
};

export const WIDGET_TYPES = {
  CHART: 'chart',
  TABLE: 'table',
  KPI: 'kpi',
  GAUGE: 'gauge',
  METRIC: 'metric',
  LIST: 'list',
  CALENDAR: 'calendar',
  MAP: 'map',
  HEATMAP: 'heatmap',
  TIMELINE: 'timeline'
};

export const KPI_CATEGORIES = {
  SALES: 'Sales',
  FINANCE: 'Finance',
  HR: 'HR',
  SUPPLY_CHAIN: 'supply_chain',
  CRM: 'CRM',
  CUSTOMER: 'Customer',
  INVENTORY: 'Inventory',
  PERFORMANCE: 'Performance'
};

export const REFRESH_INTERVALS = {
  REAL_TIME: 0,
  MINUTE_1: 60,
  MINUTE_5: 300,
  MINUTE_15: 900,
  MINUTE_30: 1800,
  HOUR_1: 3600,
  HOUR_6: 21600,
  HOUR_12: 43200,
  DAY_1: 86400,
  WEEK_1: 604800
};

export const REFRESH_LABELS = {
  [REFRESH_INTERVALS.REAL_TIME]: 'Real-time',
  [REFRESH_INTERVALS.MINUTE_1]: '1 minute',
  [REFRESH_INTERVALS.MINUTE_5]: '5 minutes',
  [REFRESH_INTERVALS.MINUTE_15]: '15 minutes',
  [REFRESH_INTERVALS.MINUTE_30]: '30 minutes',
  [REFRESH_INTERVALS.HOUR_1]: '1 hour',
  [REFRESH_INTERVALS.HOUR_6]: '6 hours',
  [REFRESH_INTERVALS.HOUR_12]: '12 hours',
  [REFRESH_INTERVALS.DAY_1]: '1 day',
  [REFRESH_INTERVALS.WEEK_1]: '1 week'
};

export const DASHBOARD_TEMPLATES = {
  SALES: 'sales',
  HR: 'hr',
  FINANCE: 'finance',
  OPERATIONS: 'operations',
  ANALYTICS: 'analytics',
  EXECUTIVE: 'executive',
  CUSTOM: 'custom'
};

export const DEFAULT_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#fff',
      borderWidth: 1
    }
  }
};
