import database from '../../../../config/db.js';
import logger from '../../../../config/logger.js';

const DIM_WAREHOUSES_TABLE = 'dim_warehouses';
export async function createDimWarehousesTable() {
  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS ${DIM_WAREHOUSES_TABLE} (
        warehouse_id INT PRIMARY KEY,
        name VARCHAR(255),
        address TEXT,
        manager_id INT
      )
    `);
    logger.info(`Table ${DIM_WAREHOUSES_TABLE} created or already exists.`);
  } catch (error) {
    logger.error('Error creating dim_warehouses table:', error);
    throw error;
  }
}