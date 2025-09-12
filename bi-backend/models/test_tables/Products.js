import database from '../../config/db.js';

const tableName = 'products'

export async function createProductsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
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
    supplier_id INT REFERENCES suppliers(supplier_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount NUMERIC(12,2),
    status VARCHAR(50)
    );
  `;
  try {
    await database.query(query);
    console.log('purchase orders table created successfully');
  } catch (error) {
    console.error('Error creating purchase orders table:', error);
    throw error;
  }
}

export async function createPurchaseOrderItemTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id SERIAL PRIMARY KEY,
      po_id INT REFERENCES purchase_orders(po_id),
      product_id INT REFERENCES products(product_id),
      quantity NUMERIC(12,2) NOT NULL,
      unit_price NUMERIC(12,2) NOT NULL,
      subtotal NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await database.query(query);
    console.log('purchase order items table created successfully');
  } catch (error) {
    console.error('Error creating purchase order items table:', error);
    throw error;
  }
}