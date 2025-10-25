import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../layouts/DashboardLayout';
import OverviewPage from '../modules/dashboards/pages/OverviewPage';

import DashboardsPage from '../modules/dashboards/pages/DashboardsPage';
import CreateDashboard from '../modules/dashboards/pages/CreateDashboard';
import DashboardDetail from '../modules/dashboards/pages/DashboardDetail';
import DashboardEdit from '../modules/dashboards/pages/DashboardEdit';

import KPIsPage from '../modules/kpis/pages/KPIsPage';
import CreateNewKPI from '../modules/kpis/pages/CreateKPIPage';
import KpiViewDetails from '../modules/kpis/pages/KPIViewDetail';
import EditKPIPage from '../modules/kpis/pages/EditKPIPage';

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
import SyncHistory from '../modules/integration/pages/SyncHistory';

// Reports and Exports
import ReportsPage from '../modules/reports/pages/ReportsPage';
import CreateReportPage from '../modules/reports/pages/CreateReportPage';
import ReportDetailPage from '../modules/reports/pages/ReportDetailPage';
import ReportEditPage from '../modules/reports/pages/ReportEditPage';
import ReportTemplatesPage from '../modules/reports/pages/ReportTemplatesPage';

import ExportsPage from '../modules/export/pages/ExportsPage';
import CreateExportPage from '../modules/export/pages/CreateExportPage';
import ExportDetailPage from '../modules/export/pages/ExportDetailPage';
import ExportHistoryPage from '../modules/export/pages/ExportHistoryPage';
import ExportTemplatesPage from '../modules/export/pages/ExportTemplatesPage';

// Auth Pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.OVERVIEW} replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      
      {/* Root redirect */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
            <Navigate to={ROUTES.OVERVIEW} replace /> : 
            <Navigate to={ROUTES.LOGIN} replace />
        } 
      />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        {/* Overview - accessible to all authenticated users */}
        <Route index element={<Navigate to={ROUTES.OVERVIEW} replace />} />
        <Route path="overview" element={<OverviewPage />} />

        {/* Dashboards - accessible to all authenticated users */}
        <Route path="dashboards" element={<DashboardsPage />} />
        <Route path="dashboards/new" element={<CreateDashboard />} />
        <Route path="dashboards/:id" element={<DashboardDetail />} />
        <Route path="dashboards/:id/edit" element={<DashboardEdit />} />

        {/* KPIs - accessible to all authenticated users except viewers */}
        <Route path="kpis" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.SALES, ROLES.HR, ROLES.FINANCE]}>
            <KPIsPage />
          </ProtectedRoute>
        } />
        <Route path="kpis/new-kpi" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.SALES, ROLES.HR, ROLES.FINANCE]}>
            <CreateNewKPI />
          </ProtectedRoute>
        } />
        <Route path="kpis/:id/detail" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.SALES, ROLES.HR, ROLES.FINANCE]}>
            <KpiViewDetails />
          </ProtectedRoute>
        } />
        <Route path="kpis/:id/edit" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST, ROLES.SALES, ROLES.HR, ROLES.FINANCE]}>
            <EditKPIPage />
          </ProtectedRoute>
        } />

        {/* Widgets - accessible to all authenticated users */}
        <Route path="widgets" element={<WidgetsPage />} />
        <Route path="widgets/new" element={<CreateWidget />} />
        <Route path="widgets/:id" element={<WidgetDetail />} />
        <Route path="widgets/:id/edit" element={<WidgetEdit />} />

        {/* Integration - accessible to admin and analyst only */}
        <Route path="integration" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}>
            <IntegrationPage />
          </ProtectedRoute>
        } />
        <Route path="integration/new-source" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}>
            <DataSourceNew />
          </ProtectedRoute>
        } />
        <Route path="integration/edit-source/:id" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}>
            <DataSourceEdit />
          </ProtectedRoute>
        } />
        <Route path="integration/view/:id" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}>
            <DataSourceDetails />
          </ProtectedRoute>
        } />
        <Route path="integration/data-sync" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}>
            <DataSync />
          </ProtectedRoute>
        } />
        <Route path="integration/import-export" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}>
            <ImportExport />
          </ProtectedRoute>
        } />
        <Route path="integration/sync-history" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST]}>
            <SyncHistory />
          </ProtectedRoute>
        } />

        {/* Reports - accessible to admin, manager, and analyst */}
        <Route path="reports" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST]}>
            <ReportsPage />
          </ProtectedRoute>
        } />
        <Route path="reports/new" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST]}>
            <CreateReportPage />
          </ProtectedRoute>
        } />
        <Route path="reports/:id" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST]}>
            <ReportDetailPage />
          </ProtectedRoute>
        } />
        <Route path="reports/:id/edit" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST]}>
            <ReportEditPage />
          </ProtectedRoute>
        } />
        <Route path="reports/templates" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.ANALYST]}>
            <ReportTemplatesPage />
          </ProtectedRoute>
        } />

        {/* Exports - accessible to all authenticated users */}
        <Route path="exports" element={<ExportsPage />} />
        <Route path="exports/new" element={<CreateExportPage />} />
        <Route path="exports/:id" element={<ExportDetailPage />} />
        <Route path="exports/:id/edit" element={<ExportDetailPage />} />
        <Route path="exports/history" element={<ExportHistoryPage />} />
        <Route path="exports/templates" element={<ExportTemplatesPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;