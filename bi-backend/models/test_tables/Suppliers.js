import database from '../../config/db.js';

const tableName = 'suppliers'

export async function createSuppliersTable() {
  const query = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        supplier_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
        status VARCHAR(50) DEFAULT 'active',
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
  try {
    await database.query(query);
    console.log('Suplliers table created successfully');
  } catch (error) {
    console.error('Error creating suppliers table:', error);
    throw error;
  }
}