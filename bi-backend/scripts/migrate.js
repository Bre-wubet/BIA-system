import logger from '../config/logger.js';

import KPI from '../models/KPI.js';
import User from '../models/User.js';
import Dashboard from '../models/Dashboard.js';
// import DashboardWidget from '../models/DashboardWidget.js'
import Report from '../models/Report.js';
import PredictiveModel from '../models/PredictiveModel.js';
import Prediction from '../models/Prediction.js';
import DataSource from '../models/DataSource.js';
import DataIntegrationLog from '../models/Data_Integration_Log.js'
import SyncedData from '../models/SyncedData.js';
import Mapping from '../models/MappingRule.js';
import KpiValue from '../models/Kpi_value.js';

// --- DIM Tables
import { createDimProductsTable } from '../models/factDataWarehouse/supply-chain/dim_tables/Dim_products.js';
import { createDimSuppliersTable } from '../models/factDataWarehouse/supply-chain/dim_tables/Dim_supplier.js';
import { createDimWarehousesTable } from '../models/factDataWarehouse/supply-chain/dim_tables/Dim_warehouse.js';
import { createDimDistributorsTable } from '../models/factDataWarehouse/supply-chain/dim_tables/Dim_distributor.js';
import { createDimUsersTable } from '../models/factDataWarehouse/supply-chain/dim_tables/Dim_user.js';
import { createDimDateTable } from '../models/factDataWarehouse/supply-chain/dim_tables/Dim_date.js'
import { createDimLogisticsProvidersTable } from '../models/factDataWarehouse/supply-chain/dim_tables/Dim_logistics_provider.js';
import { createDimDriversTable } from '../models/factDataWarehouse/supply-chain/dim_tables/Dim_driver.js';
import { createDimContractsTable } from '../models/factDataWarehouse/supply-chain/dim_tables/Dim_contract.js';

// --- FACT Tables
import {createFactProcurementTable } from '../models/factDataWarehouse/supply-chain/fact_tables/Fact_procurement.js';
import { createFactGoodsReceiptTable } from '../models/factDataWarehouse/supply-chain/fact_tables/Fact_grn_item.js';
import { createFactInvoicesTable } from '../models/factDataWarehouse/supply-chain/fact_tables/Fact_invoices.js';
import { createFactInventoryTable } from '../models/factDataWarehouse/supply-chain/fact_tables/Fact_inventory_snapshot.js';
import { createFactStockMovementsTable } from '../models/factDataWarehouse/supply-chain/fact_tables/Fact_stock_transfer.js';
import { createFactDistributionTable } from '../models/factDataWarehouse/supply-chain/fact_tables/Fact_distribution_item.js';
import { createFactDeliveryRoutesTable } from '../models/factDataWarehouse/supply-chain/fact_tables/Fact_delivery_route_event.js';
import { createFactSupplierPerformanceTable } from '../models/factDataWarehouse/supply-chain/fact_tables/Fact_supplier_performance.js';
import { createFactDistributionKpisTable } from '../models/factDataWarehouse/supply-chain/fact_tables/Fact_distribution_kpis.js'

// ----Test tables
import { createProductsTable } from '../models/test_tables/Products.js';
import { createSuppliersTable } from '../models/test_tables/Suppliers.js';
import { createPurchaseOrdersTable } from '../models/test_tables/Products.js';
import { createPurchaseOrderItemsTable } from '../models/test_tables/Products.js';
const migrate = async () => {
  try {
    logger.info('Starting database migration...');

    // Core app tables
    logger.info('Creating user management tables...');
    await User.createUserTable();
    logger.info('User table created');

    logger.info('Creating data integration tables...');
    await DataSource.createDataSourceTable();
    await DataIntegrationLog.createDataLogTable();
    await SyncedData.createSyncedDataTable();
    await Mapping.createMappingRulesTable();
    logger.info('Data integration tables created');

    logger.info('Creating dashboard tables...');
    await Dashboard.createDashboardTable();
    // await DashboardWidget.createWidgetTable();
    logger.info('Dashboard tables created');

    logger.info('Creating KPI tables...');
    await KPI.createKpiTable();
    await KpiValue.createKpiValuesTable();
    logger.info('KPI tables created');

    logger.info('Creating reporting tables...');
    await Report.createReportTable();
    logger.info('Report table created');

    logger.info('Creating predictive analytics tables...');
    await PredictiveModel.createPredictiveModelTable();
    await Prediction.createPredictionTable();
    logger.info('Predictive analytics tables created');

    // Dimensions first (must exist before facts)
    logger.info('dimension tables creating...!')

    await createDimProductsTable();
    await createDimSuppliersTable();
    await createDimWarehousesTable();
    await createDimDistributorsTable();
    await createDimUsersTable();
    await createDimDateTable();
    await createDimLogisticsProvidersTable();
    await createDimDriversTable();
    await createDimContractsTable();
    logger.info('dimension tables created successfully!')

    // Then Facts
    logger.info('Fact tables creating...!')
    await createFactProcurementTable();
    await createFactGoodsReceiptTable();
    await createFactInvoicesTable();
    await createFactInventoryTable();
    await createFactStockMovementsTable();
    await createFactDistributionTable();
    await createFactDeliveryRoutesTable();
    await createFactSupplierPerformanceTable();
    await createFactDistributionKpisTable();

    logger.info('Fact tables created successfully!')

    logger.info('Test tables creating...!')
    await createProductsTable();
    await createSuppliersTable();
    await createPurchaseOrdersTable();
    await createPurchaseOrderItemsTable();
    logger.info('Test tables created successfully!')
    
    logger.info('All tables and materialized views created successfully!');
    process.exit(0);
  } catch (err) {
    logger.error(`Migration failed: ${err.message}`);
    logger.error(err.stack);
    process.exit(1);
  }
};

migrate();