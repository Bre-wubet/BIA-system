import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';

// Hook for authentication state
export const useAuthState = () => {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
  };
};

// Hook for authentication actions
export const useAuthActions = () => {
  const {
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    getProfile,
    setLoading,
    setError,
    clearError,
  } = useAuth();

  return {
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    getProfile,
    setLoading,
    setError,
    clearError,
  };
};

// Hook for role-based access control
export const useRoleAccess = () => {
  const { user, hasRole, hasAnyRole, hasPermission } = useAuth();

  return {
    user,
    hasRole,
    hasAnyRole,
    hasPermission,
    
    // Convenience methods for common role checks
    isAdmin: () => hasRole(ROLES.ADMIN),
    isManager: () => hasRole(ROLES.MANAGER),
    isAnalyst: () => hasRole(ROLES.ANALYST),
    isUser: () => hasRole(ROLES.USER),
    
    // Permission checks
    canCreate: () => hasPermission('canCreate'),
    canEdit: () => hasPermission('canEdit'),
    canDelete: () => hasPermission('canDelete'),
    canView: () => hasPermission('canView'),
    canShare: () => hasPermission('canShare'),
    canExport: () => hasPermission('canExport'),
    canManageUsers: () => hasPermission('canManageUsers'),
    canConfigureSystem: () => hasPermission('canConfigureSystem'),
  };
};

// Hook for protected route logic
export const useProtectedRoute = (allowedRoles = []) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  const isAuthorized = () => {
    if (!isAuthenticated || !user) return false;
    if (allowedRoles.length === 0) return true;
    return allowedRoles.includes(user.role);
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    isAuthorized: isAuthorized(),
    shouldRedirect: !isLoading && (!isAuthenticated || !isAuthorized()),
  };
};

// Hook for user profile management
export const useUserProfile = () => {
  const { user, updateProfile, changePassword, isLoading, error } = useAuth();

  const handleUpdateProfile = async (profileData) => {
    try {
      await updateProfile(profileData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleChangePassword = async (passwordData) => {
    try {
      await changePassword(passwordData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    updateProfile: handleUpdateProfile,
    changePassword: handleChangePassword,
    isLoading,
    error,
  };
};

// Hook for authentication forms (login/register)
export const useAuthForm = () => {
  const { login, register, isLoading, error, clearError } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      clearError();
      await login(credentials);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleRegister = async (userData) => {
    try {
      clearError();
      await register(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    login: handleLogin,
    register: handleRegister,
    isLoading,
    error,
    clearError,
  };
};

// Hook for password reset
export const usePasswordReset = () => {
  const { requestPasswordReset, resetPassword, isLoading, error, clearError } = useAuth();

  const handleRequestReset = async (email) => {
    try {
      clearError();
      await requestPasswordReset(email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleResetPassword = async (token, newPassword) => {
    try {
      clearError();
      await resetPassword(token, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    requestReset: handleRequestReset,
    resetPassword: handleResetPassword,
    isLoading,
    error,
    clearError,
  };
};

// Hook for checking if user can access specific features
export const useFeatureAccess = () => {
  const { user, hasRole, hasAnyRole } = useAuth();

  const canAccessDashboard = (dashboardType) => {
    if (!user) return false;
    
    const dashboardAccess = {
      overview: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.USER],
      sales: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES],
      hr: [ROLES.ADMIN, ROLES.MANAGER, ROLES.HR],
      finance: [ROLES.ADMIN, ROLES.MANAGER, ROLES.FINANCE],
      operations: [ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATIONS],
      analytics: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST],
    };

    return hasAnyRole(dashboardAccess[dashboardType] || []);
  };

  const canAccessKPIs = () => {
    return hasAnyRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.SALES, ROLES.HR, ROLES.FINANCE]);
  };

  const canAccessReports = () => {
    return hasAnyRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST]);
  };

  const canAccessIntegration = () => {
    return hasAnyRole([ROLES.ADMIN, ROLES.ANALYST]);
  };

  const canAccessExports = () => {
    return hasAnyRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.SALES, ROLES.HR, ROLES.OPERATIONS]);
  };

  const canAccessSettings = () => {
    return hasAnyRole([ROLES.ADMIN, ROLES.MANAGER]);
  };

  return {
    canAccessDashboard,
    canAccessKPIs,
    canAccessReports,
    canAccessIntegration,
    canAccessExports,
    canAccessSettings,
  };
};

export default useAuth;
