// routes.js
// // navigation.js
// import { ROUTES } from './routes';
import DashboardDetail from '../modules/dashboards/pages/DashboardDetail';
import { ROLES } from './roles';

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',

  // Main Dashboard Routes (all under /dashboard)
  OVERVIEW: '/dashboard/overview',
  DASHBOARDS: '/dashboard/dashboards',
  DASHBOARD_DETAIL: '/dashboard/dashboards/:id',
  DASHBOARD_NEW: '/dashboard/dashboards/new',
  DASHBOARD_EDIT: '/dashboard/dashboards/:id/edit',

  // Dashboards
  SALES_DASHBOARD: '/dashboard/dashboards/sales',
  HR_DASHBOARD: '/dashboard/dashboards/hr',
  FINANCE_DASHBOARD: '/dashboard/dashboards/finance',
  OPERATIONS_DASHBOARD: '/dashboard/dashboards/operations',
  ANALYTICS_DASHBOARD: '/dashboard/dashboards/analytics',

  // KPIs & Widgets
  KPIS: '/dashboard/kpis',
  NEW_KPI: '/dashboard/kpis/new-kpi',
  KPI_DETAIL: '/dashboard/kpis/:id/detail',
  KPI_EDIT: '/dashboard/kpis/:id/edit',
  WIDGETS: '/dashboard/widgets',
  WIDGET_DETAIL: '/dashboard/widgets/:id',
  WIDGET_NEW: '/dashboard/widgets/new',
  WIDGET_EDIT: '/dashboard/widgets/:id/edit',

  // Predictive Analytics
  PREDICTIVE: '/dashboard/predictive',

  // Data Integration
  INTEGRATION: '/dashboard/integration',
  INTEGRATION_NEW_SOURCE: '/dashboard/integration/new-source',
  INTEGRATION_EDIT_SOURCE: '/dashboard/integration/edit-source/:id',
  INTEGRATION_VIEW_SOURCE: '/dashboard/integration/view/:id',
  INTEGRATION_DATA_SYNC: '/dashboard/integration/data-sync',
  INTEGRATION_IMPORT_EXPORT: '/dashboard/integration/import-export',
  HISTORY_SYNC_LOG: '/dashboard/integration/sync-history',

  // Reports
  REPORTS: '/dashboard/reports',
  REPORTS_NEW: '/dashboard/reports/new',
  REPORTS_DETAIL: '/dashboard/reports/:id',
  REPORTS_EDIT: '/dashboard/reports/:id/edit',
  REPORTS_TEMPLATES: '/dashboard/reports/templates',

  // Exports
  EXPORTS: '/dashboard/exports',
  EXPORTS_NEW: '/dashboard/exports/new',
  EXPORTS_DETAIL: '/dashboard/exports/:id',
  EXPORTS_EDIT: '/dashboard/exports/:id/edit',
  EXPORTS_HISTORY: '/dashboard/exports/history',
  EXPORTS_TEMPLATES: '/dashboard/exports/templates',

  // Settings
  SETTINGS: '/dashboard/settings',
  SETTINGS_GENERAL: '/dashboard/settings',
  SETTINGS_USERS: '/dashboard/settings/users',
  SETTINGS_SECURITY: '/dashboard/settings/security',
  SETTINGS_NOTIFICATIONS: '/dashboard/settings/notifications',
  SETTINGS_APPEARANCE: '/dashboard/settings/appearance',
  SETTINGS_DATA: '/dashboard/settings/data',
  SETTINGS_API: '/dashboard/settings/api',
  SETTINGS_INTEGRATIONS: '/dashboard/settings/integrations',
  SETTINGS_SYSTEM: '/dashboard/settings/system',
  PROFILE: '/dashboard/profile',

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
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST]
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
