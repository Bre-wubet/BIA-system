export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  ANALYST: 'analyst',
  USER: 'user',
  // Legacy roles for backward compatibility
  VIEWER: 'user',
  SALES: 'sales_manager',
  HR: 'hr_manager',
  FINANCE: 'finance_manager',
  OPERATIONS: 'operations_manager'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true,
    canShare: true,
    canExport: true,
    canManageUsers: true,
    canConfigureSystem: true
  },
  [ROLES.MANAGER]: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canView: true,
    canShare: true,
    canExport: true
  },
  [ROLES.ANALYST]: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canView: true,
    canShare: false,
    canExport: true
  },
  [ROLES.USER]: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canView: true,
    canShare: false,
    canExport: false
  },
  // Legacy role mappings
  [ROLES.VIEWER]: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canView: true,
    canShare: false,
    canExport: false
  },
  [ROLES.SALES]: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canView: true,
    canShare: true,
    canExport: true
  },
  [ROLES.HR]: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canView: true,
    canShare: true,
    canExport: true
  },
  [ROLES.FINANCE]: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canView: true,
    canShare: true,
    canExport: true
  }
};

export const ROLE_DASHBOARDS = {
  [ROLES.ADMIN]: [
    { key: 'overview', path: '/overview', title: 'System Overview' },
    { key: 'sales', path: '/dashboard/dashboards/sales', title: 'Sales Dashboard' },
    { key: 'hr', path: '/dashboard/dashboards/hr', title: 'HR Dashboard' },
    { key: 'finance', path: '/dashboard/dashboards/finance', title: 'Finance Dashboard' },
    { key: 'operations', path: '/dashboard/dashboards/operations', title: 'Operations Dashboard' },
    { key: 'analytics', path: '/dashboard/dashboards/analytics', title: 'Analytics Dashboard' }
  ],
  [ROLES.MANAGER]: [
    { key: 'overview', path: '/overview', title: 'Overview' },
    { key: 'sales', path: '/dashboard/dashboards/sales', title: 'Sales Dashboard' },
    { key: 'hr', path: '/dashboard/dashboards/hr', title: 'HR Dashboard' },
    { key: 'finance', path: '/dashboard/dashboards/finance', title: 'Finance Dashboard' },
    { key: 'operations', path: '/dashboard/dashboards/operations', title: 'Operations Dashboard' }
  ],
  [ROLES.ANALYST]: [
    { key: 'overview', path: '/overview', title: 'Overview' },
    { key: 'analytics', path: '/dashboard/dashboards/analytics', title: 'Analytics Dashboard' },
    { key: 'reports', path: '/reports', title: 'Reports' }
  ],
  [ROLES.VIEWER]: [
    { key: 'overview', path: '/overview', title: 'Overview' },
    { key: 'reports', path: '/reports', title: 'Reports' }
  ],
  [ROLES.SALES]: [
    { key: 'overview', path: '/overview', title: 'Overview' },
    { key: 'sales', path: '/dashboard/dashboards/sales', title: 'Sales Dashboard' },
    { key: 'analytics', path: '/dashboard/dashboards/analytics', title: 'Analytics Dashboard' }
  ],
  [ROLES.HR]: [
    { key: 'overview', path: '/overview', title: 'Overview' },
    { key: 'hr', path: '/dashboard/dashboards/hr', title: 'HR Dashboard' },
    { key: 'analytics', path: '/dashboard/dashboards/analytics', title: 'Analytics Dashboard' }
  ],
  [ROLES.FINANCE]: [
    { key: 'overview', path: '/overview', title: 'Overview' },
    { key: 'finance', path: '/dashboard/dashboards/finance', title: 'Finance Dashboard' },
    { key: 'analytics', path: '/dashboard/dashboards/analytics', title: 'Analytics Dashboard' }
  ]
};
