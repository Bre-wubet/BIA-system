import database from '../../../../config/db.js';
import logger from '../../../../config/logger.js';

const FACT_GOODS_RECEIPT_TABLE = 'fact_goods_receipt';
export async function createFactGoodsReceiptTable() {
  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS ${FACT_GOODS_RECEIPT_TABLE} (
        receipt_id SERIAL PRIMARY KEY,
        grn_id INT,
        po_id INT,
        product_id BIGINT REFERENCES dim_products(product_id),
        warehouse_id BIGINT REFERENCES dim_warehouses(warehouse_id),
        date_id BIGINT REFERENCES dim_date(date_id),
        quantity_received INT,
        condition VARCHAR(100)
      )
    `);
    logger.info(`Table ${FACT_GOODS_RECEIPT_TABLE} created or already exists.`);
  } catch (error) {
    logger.error('Error creating fact_goods_receipt table:', error);
    throw error;
  }
}