import database from '../../../../config/db.js';
import logger from '../../../../config/logger.js';

const DIM_DRIVERS_TABLE = 'dim_drivers';
export async function createDimDriversTable() {
  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS ${DIM_DRIVERS_TABLE} (
        driver_id INT PRIMARY KEY,
        name VARCHAR(255),
        license_number VARCHAR(100)
      )
    `);
    logger.info(`Table ${DIM_DRIVERS_TABLE} created or already exists.`);
  } catch (error) {
    logger.error('Error creating dim_drivers table:', error);
    throw error;
  }
}