import database from '../../../../config/db.js';
import logger from '../../../../config/logger.js';

const FACT_DELIVERY_ROUTES_TABLE = 'fact_delivery_routes';
export async function createFactDeliveryRoutesTable() {
  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS ${FACT_DELIVERY_ROUTES_TABLE} (
        route_fact_id SERIAL PRIMARY KEY,
        route_id INT,
        order_id INT,
        driver_id BIGINT REFERENCES dim_drivers(driver_id),
        date_id BIGINT REFERENCES dim_date(date_id),
        distance_km NUMERIC(10,2),
        estimated_duration_minutes INT,
        actual_arrival_time TIMESTAMP,
        status VARCHAR(50)
      )
    `);
    logger.info(`Table ${FACT_DELIVERY_ROUTES_TABLE} created or already exists.`);
  } catch (error) {
    logger.error('Error creating fact_delivery_routes table:', error);
    throw error;
  }
}