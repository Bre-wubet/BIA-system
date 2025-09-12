import database from '../../../../config/db.js';
import logger from '../../../../config/logger.js';

const DIM_DATE_TABLE = 'dim_date';
export async function createDimDateTable() {
  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS ${DIM_DATE_TABLE} (
        date_id SERIAL PRIMARY KEY,
        full_date DATE UNIQUE,
        day INT,
        week INT,
        month INT,
        quarter INT,
        year INT
      )
    `);
    logger.info(`Table ${DIM_DATE_TABLE} created or already exists.`);
  } catch (error) {
    logger.error('Error creating dim_date table:', error);
    throw error;
  }
}