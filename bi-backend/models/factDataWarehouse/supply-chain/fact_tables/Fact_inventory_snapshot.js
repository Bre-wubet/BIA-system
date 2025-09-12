import database from '../../../../config/db.js';
import logger from '../../../../config/logger.js';

const FACT_INVENTORY_TABLE = 'fact_inventory';
export async function createFactInventoryTable() {
  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS ${FACT_INVENTORY_TABLE} (
        inventory_id SERIAL PRIMARY KEY,
        product_key BIGINT REFERENCES dim_products(id),
        warehouse_id BIGINT REFERENCES dim_warehouses(warehouse_id),
        date_id INT REFERENCES dim_date(date_id),
        quantity INT,
        cost NUMERIC(10,2),
        total_value NUMERIC(12,2)
      )
    `);
    logger.info(`Table ${FACT_INVENTORY_TABLE} created or already exists.`);
  } catch (error) {
    logger.error('Error creating fact_inventory table:', error);
    throw error;
  }
}
