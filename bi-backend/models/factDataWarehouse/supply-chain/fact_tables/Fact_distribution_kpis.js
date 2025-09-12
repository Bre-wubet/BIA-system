import database from '../../../../config/db.js';
import logger from '../../../../config/logger.js';

const FACT_DISTRIBUTION_KPIS_TABLE = 'fact_distribution_kpis';
export async function createFactDistributionKpisTable() {
  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS ${FACT_DISTRIBUTION_KPIS_TABLE} (
        kpi_id SERIAL PRIMARY KEY,
        distributor_id BIGINT REFERENCES dim_distributors(distributor_id),
        date_id BIGINT REFERENCES dim_date(date_id),
        kpi_type VARCHAR(100),
        value NUMERIC(10,2)
      )
    `);
    logger.info(`Table ${FACT_DISTRIBUTION_KPIS_TABLE} created or already exists.`);
  } catch (error) {
    logger.error('Error creating fact_distribution_kpis table:', error);
    throw error;
  }
}