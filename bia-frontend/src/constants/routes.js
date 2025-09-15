// routes.js
// // navigation.js
// import { ROUTES } from './routes';
import DashboardDetail from '../modules/dashboards/pages/DashboardDetail';
import { ROLES } from './roles';

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',

  // Main
  DASHBOARDS: '/dashboards',
  DASHBOARD_DETAIL: '/dashboards/:id',
  DASHBOARD_NEW: '/dashboards/new',
  DASHBOARD_EDIT: '/dashboards/:id/edit',
  OVERVIEW: '/overview',

  // Dashboards
  SALES_DASHBOARD: '/dashboards/sales',
  HR_DASHBOARD: '/dashboards/hr',
  FINANCE_DASHBOARD: '/dashboards/finance',
  OPERATIONS_DASHBOARD: '/dashboards/operations',
  ANALYTICS_DASHBOARD: '/dashboards/analytics',

  // KPIs & Widgets
  KPIS: '/kpis',
  NEW_KPI: '/kpis/new-kpi',
  KPI_DETAIL: '/kpis/:id/detail',
  KPI_EDIT: '/kpis/:id/edit',
  WIDGETS: '/widgets',
  WIDGET_DETAIL: '/widgets/:id',
  WIDGET_NEW: '/widgets/new',
  WIDGET_EDIT: '/widgets/:id/edit',

  // Predictive Analytics
  PREDICTIVE: '/predictive',

  // Data Integration
  INTEGRATION: '/integration',
  INTEGRATION_NEW_SOURCE: '/integration/new-source',
  INTEGRATION_EDIT_SOURCE: '/integration/edit-source/:id',
  INTEGRATION_VIEW_SOURCE: '/integration/view/:id',
  INTEGRATION_DATA_SYNC: '/integration/data-sync',
  INTEGRATION_IMPORT_EXPORT: '/integration/import-export',
  HISTORY_SYNC_LOG: '/integration/sync-history',

  // Reports
  REPORTS: '/reports',
  REPORTS_NEW: '/reports/new',
  REPORTS_DETAIL: '/reports/:id',
  REPORTS_EDIT: '/reports/:id/edit',
  REPORTS_TEMPLATES: '/reports/templates',

  // Exports
  EXPORTS: '/exports',
  EXPORTS_NEW: '/exports/new',
  EXPORTS_DETAIL: '/exports/:id',
  EXPORTS_EDIT: '/exports/:id/edit',
  EXPORTS_HISTORY: '/exports/history',
  EXPORTS_TEMPLATES: '/exports/templates',

  // Settings
  SETTINGS: '/settings',
  SETTINGS_GENERAL: '/settings',
  SETTINGS_USERS: '/settings/users',
  SETTINGS_SECURITY: '/settings/security',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  SETTINGS_APPEARANCE: '/settings/appearance',
  SETTINGS_DATA: '/settings/data',
  SETTINGS_API: '/settings/api',
  SETTINGS_INTEGRATIONS: '/settings/integrations',
  SETTINGS_SYSTEM: '/settings/system',
  PROFILE: '/profile',

  // Errors
  NOT_FOUND: '/404'
};


export const NAVIGATION_ITEMS = [
  // --- Dashboard Section ---
  {
    title: 'Overview',
    path: ROUTES.OVERVIEW,
    icon: 'dashboard',
    section: 'dashboard',
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.VIEWER]
  },
  {
    title: 'Finance Overview',
    path: ROUTES.OVERVIEW,
    icon: 'dashboard',
    section: 'dashboard',
    roles: [ROLES.FINANCE]
  },
  {
    title: 'HR Overview',
    path: ROUTES.OVERVIEW,
    icon: 'dashboard',
    section: 'dashboard',
    roles: [ROLES.HR]
  },
  {
    title: 'Operations Overview',
    path: ROUTES.OVERVIEW,
    icon: 'dashboard',
    section: 'dashboard',
    roles: [ROLES.OPERATIONS]
  },
  {
    title: 'Sales Overview',
    path: ROUTES.OVERVIEW,
    icon: 'dashboard',
    section: 'dashboard',
    roles: [ROLES.SALES]
  },
  {
    title: 'Main Dashboard',
    path: ROUTES.DASHBOARDS,
    icon: 'dashboard',
    section: 'dashboard',
    roles: [ROLES.ADMIN, ROLES.MANAGER]
  },
  {
    title: 'Sales Dashboard',
    path: ROUTES.SALES,
    icon: 'dashboard',
    section: 'dashboard',
    roles: [ROLES.SALES]
  },
  {
    title: 'HR Dashboard',
    path: ROUTES.HR_DASHBOARD,
    icon: 'dashboard',
    section: 'dashboard',
    roles: [ROLES.HR]
  },
  {
    title: 'Finance Dashboard',
    path: ROUTES.FINANCE_DASHBOARD,
    icon: 'dashboard',
    section: 'dashboard',
    roles: [ROLES.FINANCE]
  },
  {
    title: 'Operations Dashboard',
    path: ROUTES.OPERATIONS_DASHBOARD,
    icon: 'dashboard',
    section: 'dashboard',
    roles: [ROLES.OPERATIONS]
  },

  // --- KPI & Widgets Section ---
  {
    title: 'KPIs',
    path: ROUTES.KPIS,
    icon: 'trending_up',
    section: 'analytics',
    roles: [ROLES.ADMIN, ROLES.MANAGER]
  },
  {
    title: 'Expense vs Revenue',
    path: ROUTES.KPIS,
    icon: 'trending_up',
    section: 'analytics',
    roles: [ROLES.FINANCE]
  },
  {
    title: 'Campaign Performance',
    path: ROUTES.KPIS,
    icon: 'trending_up',
    section: 'analytics',
    roles: [ROLES.SALES]
  },
  {
    title: 'Leads & Conversions',
    path: ROUTES.KPIS,
    icon: 'trending_up',
    section: 'analytics',
    roles: [ROLES.SALES]
  },
  {
    title: 'Employee Performance',
    path: ROUTES.KPIS,
    icon: 'trending_up',
    section: 'analytics',
    roles: [ROLES.HR]
  },
  {
    title: 'Supply Chain Performance',
    path: ROUTES.KPIS,
    icon: 'trending_up',
    section: 'analytics',
    roles: [ROLES.OPERATIONS]
  },
  // {
  //   title: 'Widgets',
  //   path: ROUTES.WIDGETS,
  //   icon: 'widgets',
  //   section: 'analytics',
  //   roles: [ROLES.ADMIN, ROLES.MANAGER]
  // },

  // --- Predictive Analytics Section ---
  {
    title: 'Predictive Analytics',
    path: ROUTES.PREDICTIVE,
    icon: 'analytics',
    section: 'analytics',
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.SALES, ROLES.HR, ROLES.FINANCE]
  },

  // --- Data Integration Section ---
  {
    title: 'Data Integration',
    path: ROUTES.INTEGRATION,
    icon: 'integration_instructions',
    section: 'integration',
    roles: [ROLES.ADMIN, ROLES.ANALYST]
  },
    {
    title: 'Sync History',
    path: ROUTES.HISTORY_SYNC_LOG,
    icon: 'integration_instructions',
    section: 'integration',
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.SALES, ROLES.HR, ROLES.FINANCE]
  },

  // --- Reports Section ---
  {
    title: 'Reports',
    path: ROUTES.REPORTS,
    icon: 'assessment',
    section: 'reports',
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST]
  },

  {
    title: 'Attrition & Retention Reports',
    path: ROUTES.REPORTS,
    icon: 'assessment',
    section: 'reports',
    roles: [ROLES.HR]
  },
  {
    title: 'Forecast Reports',
    path: ROUTES.REPORTS,
    icon: 'assessment',
    section: 'reports',
    roles: [ROLES.FINANCE]
  },
  {
    title: 'Export Center',
    path: ROUTES.EXPORTS,
    icon: 'file_download',
    section: 'reports',
    roles: [ROLES.FINANCE]
  },
  {
    title: 'Exports',
    path: ROUTES.EXPORTS,
    icon: 'file_download',
    section: 'reports',
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.SALES, ROLES.HR, ROLES.OPERATIONS]
  },
  
  // --- Settings Section ---
  {
    title: 'Settings',
    path: ROUTES.SETTINGS,
    icon: 'settings',
    section: 'settings',
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.FINANCE, ROLES.SALES, ROLES.HR, ROLES.OPERATIONS]
  }
];
