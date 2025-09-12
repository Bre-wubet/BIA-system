import database from '../../../../config/db.js';
import logger from '../../../../config/logger.js';

const FACT_PROCUREMENT_TABLE = 'fact_procurement';
export async function createFactProcurementTable() {
  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS ${FACT_PROCUREMENT_TABLE} (
        procurement_id SERIAL PRIMARY KEY,
        po_id INT,
        product_key BIGINT REFERENCES dim_products(id),
        supplier_id BIGINT REFERENCES dim_suppliers(supplier_id),
        date_id BIGINT REFERENCES dim_date(date_id),
        quantity INT,
        unit_price NUMERIC(10,2),
        subtotal NUMERIC(12,2),
        total_amount NUMERIC(12,2),
        status VARCHAR(50)
      )
    `);
    logger.info(`Table ${FACT_PROCUREMENT_TABLE} created or already exists.`);
  } catch (error) {
    logger.error('Error creating fact_procurement table:', error);
    throw error;
  }
}
