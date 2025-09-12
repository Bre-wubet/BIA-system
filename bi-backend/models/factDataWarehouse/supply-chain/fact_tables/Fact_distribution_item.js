import database from '../../../../config/db.js';
import logger from '../../../../config/logger.js';

const FACT_DISTRIBUTION_TABLE = 'fact_distribution';
export async function createFactDistributionTable() {
  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS ${FACT_DISTRIBUTION_TABLE} (
        distribution_id SERIAL PRIMARY KEY,
        order_id INT,
        distributor_id BIGINT REFERENCES dim_distributors(distributor_id),
        product_key BIGINT REFERENCES dim_products(id),
        logistics_provider_id BIGINT REFERENCES dim_logistics_providers(provider_id),
        date_id BIGINT REFERENCES dim_date(date_id),
        quantity INT,
        delivery_status VARCHAR(50),
        fulfillment_method VARCHAR(50)
      )
    `);
    logger.info(`Table ${FACT_DISTRIBUTION_TABLE} created or already exists.`);
  } catch (error) {
    logger.error('Error creating fact_distribution table:', error);
    throw error;
  }
}