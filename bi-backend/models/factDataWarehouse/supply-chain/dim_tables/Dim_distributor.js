import database from '../../../../config/db.js';
import logger from '../../../../config/logger.js';

const DIM_DISTRIBUTORS_TABLE = 'dim_distributors';
export async function createDimDistributorsTable() {
  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS ${DIM_DISTRIBUTORS_TABLE} (
        distributor_id INT PRIMARY KEY,
        name VARCHAR(255),
        address TEXT,
        status VARCHAR(50)
      )
    `);
    logger.info(`Table ${DIM_DISTRIBUTORS_TABLE} created or already exists.`);
  } catch (error) {
    logger.error('Error creating dim_distributors table:', error);
    throw error;
  }
}