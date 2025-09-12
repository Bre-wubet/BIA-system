import database from '../../../../config/db.js';
import logger from '../../../../config/logger.js';

const FACT_INVOICES_TABLE = 'fact_invoices';
export async function createFactInvoicesTable() {
  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS ${FACT_INVOICES_TABLE} (
        invoice_fact_id SERIAL PRIMARY KEY,
        invoice_id INT,
        po_id INT,
        supplier_id BIGINT REFERENCES dim_suppliers(supplier_id),
        date_id BIGINT REFERENCES dim_date(date_id),
        amount_due NUMERIC(12,2),
        tax NUMERIC(10,2),
        amount_paid NUMERIC(12,2),
        payment_status VARCHAR(50)
      )
    `);
    logger.info(`Table ${FACT_INVOICES_TABLE} created or already exists.`);
  } catch (error) {
    logger.error('Error creating fact_invoices table:', error);
    throw error;
  }
}