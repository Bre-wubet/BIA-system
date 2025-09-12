import database from '../../../../config/db.js';
import logger from '../../../../config/logger.js';

const FACT_STOCK_MOVEMENTS_TABLE = 'stock_transfer';
export async function createFactStockMovementsTable() {
  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS ${FACT_STOCK_MOVEMENTS_TABLE} (
        movement_id SERIAL PRIMARY KEY,
        transfer_id INT,
        product_id BIGINT REFERENCES dim_products(product_id),
        from_warehouse_id BIGINT REFERENCES dim_warehouses(warehouse_id),
        to_warehouse_id BIGINT REFERENCES dim_warehouses(warehouse_id),
        date_id BIGINT REFERENCES dim_date(date_id),
        quantity_transferred INT,
        status VARCHAR(50)
      )
    `);
    logger.info(`Table ${FACT_STOCK_MOVEMENTS_TABLE} created or already exists.`);
  } catch (error) {
    logger.error('Error creating fact_stock_movements table:', error);
    throw error;
  }
}