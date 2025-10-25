export const formatRole = (role) => {
  if (typeof role === 'string') {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  return 'User';
};

export const getRoleBadgeColor = (role) => {
  const colors = {
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-blue-100 text-blue-800',
    analyst: 'bg-green-100 text-green-800',
    user: 'bg-gray-100 text-gray-800',
    viewer: 'bg-purple-100 text-purple-800'
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};
