import database from '../../../../config/db.js';
import logger from '../../../../config/logger.js';

const DIM_CONTRACTS_TABLE = 'dim_contracts';
export async function createDimContractsTable() {
  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS ${DIM_CONTRACTS_TABLE} (
        contract_id INT PRIMARY KEY,
        supplier_id INT REFERENCES dim_suppliers(supplier_id),
        start_date DATE,
        end_date DATE,
        status VARCHAR(50)
      )
    `);
    logger.info(`Table ${DIM_CONTRACTS_TABLE} created or already exists.`);
  } catch (error) {
    logger.error('Error creating dim_contracts table:', error);
    throw error;
  }
}
