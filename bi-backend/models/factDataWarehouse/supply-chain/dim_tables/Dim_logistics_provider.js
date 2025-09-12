import database from '../../../../config/db.js';
import logger from '../../../../config/logger.js';

const DIM_LOGISTICS_PROVIDERS_TABLE = 'dim_logistics_providers';
export async function createDimLogisticsProvidersTable() {
  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS ${DIM_LOGISTICS_PROVIDERS_TABLE} (
        provider_id INT PRIMARY KEY,
        name VARCHAR(255),
        service_type VARCHAR(50)
      )
    `);
    logger.info(`Table ${DIM_LOGISTICS_PROVIDERS_TABLE} created or already exists.`);
  } catch (error) {
    logger.error('Error creating dim_logistics_providers table:', error);
    throw error;
  }
}