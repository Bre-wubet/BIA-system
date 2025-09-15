import database from '../config/db.js';

const tableName = 'data_integration_log_record';

export async function ensureTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id SERIAL PRIMARY KEY,
      log_id INTEGER NOT NULL REFERENCES data_integration_log(id) ON DELETE CASCADE,
      record JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_${tableName}_log_id ON ${tableName}(log_id);
  `;
  await database.query(query);
}

export async function insertMany(logId, records) {
  if (!Array.isArray(records) || records.length === 0) return { inserted: 0 };
  const values = [];
  const placeholders = records.map((_, i) => {
    values.push(logId, JSON.stringify(records[i]));
    const base = i * 2;
    return `($${base + 1}, $${base + 2})`;
  }).join(',');
  const query = `INSERT INTO ${tableName} (log_id, record) VALUES ${placeholders}`;
  await database.query(query, values);
  return { inserted: records.length };
}

export async function getByLogId(logId, { page = 1, limit = 50 } = {}) {
  // Ensure table exists to avoid errors in fresh environments
  try { await ensureTable(); } catch {}
  const offset = (page - 1) * limit;
  const dataQuery = `
    SELECT id, record, created_at
    FROM ${tableName}
    WHERE log_id = $1
    ORDER BY id ASC
    LIMIT $2 OFFSET $3
  `;
  const countQuery = `SELECT COUNT(*)::int AS total FROM ${tableName} WHERE log_id = $1`;
  const [dataRes, countRes] = await Promise.all([
    database.query(dataQuery, [logId, limit, offset]),
    database.query(countQuery, [logId])
  ]);
  const rows = dataRes?.rows ?? dataRes ?? [];
  const countRow = (countRes?.rows && countRes.rows[0]) || countRes?.[0] || { total: 0 };
  const total = countRow.total || 0;
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: rows
  };
}

export default {
  ensureTable,
  insertMany,
  getByLogId
};


