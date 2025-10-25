// Utility functions for DashboardLayout

export const formatRole = (role) => {
  if (typeof role === 'string') {
    return role.replace('_', ' ');
  }
  return 'User';
};

export const getProfileImageUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  return `http://localhost:3000${avatar}`;
};

export const handleImageError = (e) => {
  e.target.style.display = 'none';
  if (e.target.nextSibling) {
    e.target.nextSibling.style.display = 'block';
  }
};

export const isActiveRoute = (path, location) => {
  if (path === '/overview') {
    return location.pathname === path;
  }
  return location.pathname.startsWith(path);
};

export const getRoleBadgeColors = () => ({
  admin: "bg-blue-100 text-blue-700",
  manager: "bg-indigo-100 text-indigo-700",
  finance: "bg-green-100 text-green-700",
  sales: "bg-yellow-100 text-yellow-700",
  hr: "bg-purple-100 text-purple-700",
  operations: "bg-red-100 text-red-700",
});

export const getQuickActions = (role) => {
  switch (role) {
    case 'finance':
      return ["New Budget Report", "Export Ledger"];
    case 'sales':
      return ["New Campaign Report", "Export Leads"];
    case 'hr':
      return ["New Employee Report", "Export HR Data"];
    case 'operations':
      return ["New Operations Report", "Export Supply Chain Data"];
    case 'manager':
      return ["New Performance Report", "Export Team Data"];
    case 'admin':
      return ["User Management", "System Settings"];
    default:
      return ["New Report", "Export Data"];
  }
};
