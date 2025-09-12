// Integration module index file

// Import pages
import IntegrationPage from './pages/IntegrationPage';
import DataSync from './pages/DataSync';
//import ImportExport from './pages/ImportExport';
import DataSourceNew from './pages/DataSourceNew';
import DataSourceEdit from './pages/DataSourceEdit';

// Import components
// import DataCleanser from './components/DataCleanser';
// import ComplianceCheck from './components/ComplianceCheck';

// Export all components
export {
  // Pages
  IntegrationPage,
  DataSync,
  // ImportExport,
  DataSourceNew,
  DataSourceEdit,
  
  // Components
  // DataCleanser,
  // ComplianceCheck
};

// Default export for the main page
export default IntegrationPage;