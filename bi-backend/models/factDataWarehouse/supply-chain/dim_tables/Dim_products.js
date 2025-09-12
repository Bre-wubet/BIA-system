import database from '../../../../config/db.js';
import logger from '../../../../config/logger.js';

const DIM_PRODUCTS_TABLE = 'dim_products';
export async function createDimProductsTable() {
  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS ${DIM_PRODUCTS_TABLE} (
        id SERIAL PRIMARY KEY,
        product_id INT,
        name VARCHAR(255),
        sku VARCHAR(100),
        category VARCHAR(100),
        unit VARCHAR(50),
        product_type VARCHAR(50)
      )
    `);
    logger.info(`Table ${DIM_PRODUCTS_TABLE} created or already exists.`);
  } catch (error) {
    logger.error('Error creating dim_products table:', error);
    throw error;
  }
}