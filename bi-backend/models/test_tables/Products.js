import database from '../../config/db.js';

const tableName = 'products'

export async function createProductsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
    id SERIAL PRIMARY KEY,
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(50) NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await database.query(query);
    console.log('Products table created successfully');
  } catch (error) {
    console.error('Error creating products table:', error);
    throw error;
  }
}

export async function createPurchaseOrdersTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS purchase_orders (
      po_id SERIAL PRIMARY KEY,
      supplier_id INT NOT NULL REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
      status VARCHAR(50) NOT NULL DEFAULT 'pending'
    );

    CREATE INDEX IF NOT EXISTS idx_po_supplier ON purchase_orders(supplier_id);
    CREATE INDEX IF NOT EXISTS idx_po_created_at ON purchase_orders(created_at);
  `;
  try {
    await database.query(query);
    console.log('purchase_orders table created successfully');
  } catch (error) {
    console.error('Error creating purchase_orders table:', error);
    throw error;
  }
}
export async function createPurchaseOrderItemsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id SERIAL PRIMARY KEY,
      po_id INT NOT NULL REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
      product_id INT NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
      quantity NUMERIC(12,2) NOT NULL CHECK (quantity > 0),
      unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
      subtotal NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_poi_po_id ON purchase_order_items(po_id);
    CREATE INDEX IF NOT EXISTS idx_poi_product_id ON purchase_order_items(product_id);
  `;
  try {
    await database.query(query);
    console.log('purchase_order_items table created successfully');
  } catch (error) {
    console.error('Error creating purchase_order_items table:', error);
    throw error;
  }
}