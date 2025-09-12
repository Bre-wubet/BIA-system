import database from '../../../../config/db.js';
import logger from '../../../../config/logger.js';

const DIM_SUPPLIERS_TABLE = 'dim_suppliers';
export async function createDimSuppliersTable() {
  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS ${DIM_SUPPLIERS_TABLE} (
        supplier_id INT PRIMARY KEY,
        name VARCHAR(255),
        rating INT,
        status VARCHAR(50),
        address TEXT
      )
    `);
    logger.info(`Table ${DIM_SUPPLIERS_TABLE} created or already exists.`);
  } catch (error) {
    logger.error('Error creating dim_suppliers table:', error);
    throw error;
  }
}