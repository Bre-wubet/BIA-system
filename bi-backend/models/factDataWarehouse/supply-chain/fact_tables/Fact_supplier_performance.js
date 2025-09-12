import database from '../../../../config/db.js';
import logger from '../../../../config/logger.js';

const FACT_SUPPLIER_PERFORMANCE_TABLE = 'fact_supplier_performance';
export async function createFactSupplierPerformanceTable() {
  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS ${FACT_SUPPLIER_PERFORMANCE_TABLE} (
        supplier_perf_id SERIAL PRIMARY KEY,
        supplier_id BIGINT REFERENCES dim_suppliers(supplier_id),
        date_id BIGINT REFERENCES dim_date(date_id),
        on_time_deliveries INT,
        total_orders INT,
        avg_delivery_time NUMERIC(5,2)
      )
    `);
    logger.info(`Table ${FACT_SUPPLIER_PERFORMANCE_TABLE} created or already exists.`);
  } catch (error) {
    logger.error('Error creating fact_supplier_performance table:', error);
    throw error;
  }
}