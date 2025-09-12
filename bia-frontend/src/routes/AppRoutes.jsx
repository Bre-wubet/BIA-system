import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import DashboardLayout from '../layouts/DashboardLayout';
import OverviewPage from '../modules/dashboards/pages/OverviewPage';

import DashboardsPage from '../modules/dashboards/pages/DashboardsPage';
import CreateDashboard from '../modules/dashboards/pages/CreateDashboard';
import DashboardDetail from '../modules/dashboards/pages/DashboardDetail';
import DashboardEdit from '../modules/dashboards/pages/DashboardEdit';

import KPIsPage from '../modules/kpis/pages/KPIsPage';
import CreateNewKPI from '../modules/kpis/pages/CreateKPIPage';
import KpiViewDetails from '../modules/kpis/pages/KPIViewDetail';

import WidgetsPage from '../modules/widgets/pages/WidgetsPage';
import WidgetDetail from '../modules/widgets/pages/WidgetDetail';
import WidgetEdit from '../modules/widgets/pages/WidgetEdit';
import CreateWidget from '../modules/widgets/pages/CreateWidget';

import IntegrationPage from '../modules/integration/pages/IntegrationPage';
import DataSourceNew from '../modules/integration/pages/DataSourceNew';
import DataSourceEdit from '../modules/integration/pages/DataSourceEdit';
import DataSourceDetails from '../modules/integration/pages/DataSourceDetails';
import DataSync from '../modules/integration/pages/DataSync';
import ImportExport from '../modules/integration/pages/ImportExport';
import SyncHistory from '../modules/integration/pages/SyncHistory'
// Mock authentication context - in real app, this would come from AuthContext
const useAuth = () => ({
  user: { role: ROLES.ADMIN, id: 1 },
  isAuthenticated: true
});

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.OVERVIEW} replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (

      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.LOGIN} element={<div>Login Page</div>} />
        <Route path={ROUTES.REGISTER} element={<div>Register Page</div>} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          {/* Overview - accessible to all authenticated users */}
          {/* <Route index element={<Navigate to={ROUTES.OVERVIEW} replace />} /> */}
          <Route path={ROUTES.OVERVIEW} element={
            <ProtectedRoute><OverviewPage /></ProtectedRoute>
          } />

          {/* Dashboards - accessible to all authenticated users */}
          <Route path={ROUTES.DASHBOARDS} element={
            <ProtectedRoute><DashboardsPage /></ProtectedRoute>
          } />
          <Route path={ROUTES.DASHBOARD_NEW} element={
            <ProtectedRoute><CreateDashboard /></ProtectedRoute>
          } />
          <Route path={ROUTES.DASHBOARD_DETAIL} element={
            <ProtectedRoute><DashboardDetail /></ProtectedRoute>
          } />
          <Route path={ROUTES.DASHBOARD_EDIT} element={
            <ProtectedRoute><DashboardEdit /></ProtectedRoute>
          } />

          {/* KPIs - accessible to all authenticated users except viewers */}
          <Route path={ROUTES.KPIS} element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.SALES, ROLES.HR, ROLES.FINANCE]}>
              <KPIsPage />
            </ProtectedRoute>
          } />
          <Route path={ROUTES.NEW_KPI} element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.SALES, ROLES.HR, ROLES.FINANCE]}>
              <CreateNewKPI />
            </ProtectedRoute>
          } />
          <Route path={ROUTES.KPI_DETAIL} element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.SALES, ROLES.HR, ROLES.FINANCE]}>
              <KpiViewDetails />
            </ProtectedRoute>
          } />
          {/* Widgets - accessible to all authenticated users except viewers */}
          <Route path={ROUTES.WIDGETS} element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.SALES, ROLES.HR, ROLES.FINANCE]}>
              <WidgetsPage />
            </ProtectedRoute>
          } />

          {/* Create Widget - accessible to all authenticated users except viewers */}
          <Route path={ROUTES.WIDGET_NEW} element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.SALES, ROLES.HR, ROLES.FINANCE]}>
              <CreateWidget />
            </ProtectedRoute>
          } />

          {/* Widget Detail - accessible to all authenticated users except viewers */}
          <Route path={ROUTES.WIDGET_DETAIL} element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.SALES, ROLES.HR, ROLES.FINANCE]}>
              <WidgetDetail />
            </ProtectedRoute>
          } />

          {/* Widget Edit - accessible to all authenticated users except viewers */}
          <Route path={ROUTES.WIDGET_EDIT} element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.SALES, ROLES.HR, ROLES.FINANCE]}>
              <WidgetEdit />
            </ProtectedRoute>
          } />

          {/* Predictive Analytics - accessible to all authenticated users except viewers */}
          <Route path={ROUTES.PREDICTIVE} element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.SALES, ROLES.HR, ROLES.FINANCE]}>
              <div>Predictive Analytics Page</div>
            </ProtectedRoute>
          } />
          
          {/* Data Integration - accessible only to admin, manager, and analyst */}
          <Route path={ROUTES.INTEGRATION} element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST]}>
              <IntegrationPage />
            </ProtectedRoute>
          } />
          <Route path={ROUTES.INTEGRATION_NEW_SOURCE} element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST]}>
              <DataSourceNew />
            </ProtectedRoute>
          } />
          <Route path={ROUTES.INTEGRATION_EDIT_SOURCE} element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST]}>
              <DataSourceEdit />
            </ProtectedRoute>
          } />
          <Route path={ROUTES.INTEGRATION_DATA_SYNC} element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST]}>
              <DataSync />
            </ProtectedRoute>
          } />
          <Route path={ROUTES.INTEGRATION_IMPORT_EXPORT} element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST]}>
              <ImportExport />
            </ProtectedRoute>
          } />
          <Route path={ROUTES.INTEGRATION_VIEW_SOURCE} element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST]}>
              <DataSourceDetails />
            </ProtectedRoute>
          } />
          <Route path={ROUTES.HISTORY_SYNC_LOG} element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST]}>
              <SyncHistory />
            </ProtectedRoute>
          } />
          {/* Reports - accessible to all authenticated users */}
          <Route path={ROUTES.REPORTS} element={<div>Reports Page</div>} />
          
          {/* Settings - accessible to all authenticated users */}
          <Route path={ROUTES.SETTINGS} element={<div>Settings Page</div>} />
          <Route path={ROUTES.PROFILE} element={<div>Profile Page</div>} />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to={ROUTES.OVERVIEW} replace />} />
      </Routes>

  );
};

export default AppRoutes;
