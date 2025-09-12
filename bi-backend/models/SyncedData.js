import database from '../config/db.js';


async function createSyncedDataTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS synced_data (
        id SERIAL PRIMARY KEY,
        source VARCHAR(100) NOT NULL,
        payload JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await database.query(query);
  console.log('Data synced table created successfully');
}

export default {
    createSyncedDataTable
}