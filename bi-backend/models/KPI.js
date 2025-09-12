// kpi.model.js
import database from '../config/db.js';

const tableName = 'kpis';

async function createKpiTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100) NOT NULL,
      formula TEXT NOT NULL,
      unit VARCHAR(50),
      type VARCHAR(100) NOT NULL,
      target_value DECIMAL(15,2),
      refresh_frequency INTEGER DEFAULT 3600,
      dashboard_id INTEGER REFERENCES dashboards(id),
      is_active BOOLEAN DEFAULT true,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await database.query(query);
}

async function createKpi(kpiData) {
  const {
    name,
    description,
    category,
    formula,
    type,
    unit,
    target_value,
    refresh_frequency,
    dashboard_id,
    created_by
  } = kpiData;

  const query = `
    INSERT INTO ${tableName} 
    (name, description, category, formula, type, unit, target_value, refresh_frequency, dashboard_id, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
  const values = [name, description, category, formula, type, unit, target_value, refresh_frequency, dashboard_id, created_by];

  const result = await database.query(query, values);
  return result.rows[0];
}

async function findById(id) {
  const query = `SELECT * FROM ${tableName} WHERE id = $1 AND is_active = true`;
  const result = await database.query(query, [id]);
  return result.rows[0] || null;
}

async function findByCategory(category) {
  const query = `SELECT * FROM ${tableName} WHERE category = $1 AND is_active = true ORDER BY name`;
  return database.query(query, [category]);
}

async function getAllKPIs() {
  const query = `
    SELECT k.*, u.username AS created_by_name
    FROM ${tableName} k
    LEFT JOIN users u ON k.created_by = u.id
    WHERE k.is_active = true
    ORDER BY k.category, k.name
  `;
  return database.query(query);
}

async function updateKpi(id, updateData) {
  const {
    name,
    description,
    category,
    formula,
    type,
    unit,
    target_value,
    refresh_frequency
  } = updateData;

  const query = `
    UPDATE ${tableName}
    SET name = COALESCE($1, name),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        formula = COALESCE($4, formula),
        type = COALESCE($5, type),
        unit = COALESCE($6, unit),
        target_value = COALESCE($7, target_value),
        refresh_frequency = COALESCE($8, refresh_frequency),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $9
    RETURNING *
  `;
  const values = [name, description, category, formula, type, unit, target_value, refresh_frequency, id];
  const result = await database.query(query, values);
  return result.rows[0];
}
async function deleteKPI(id) {
  const query = `UPDATE ${tableName} SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id`;
  const result = await database.query(query, [id]);
  return result.rows[0];
}

async function getKPIsByCategory(category) {
  const query = `
    SELECT k.*, u.username AS created_by_name
    FROM ${tableName} k
    LEFT JOIN users u ON k.created_by = u.id
    WHERE k.category = $1 AND k.is_active = true
    ORDER BY k.name
  `;
  return database.query(query, [category]);
}

async function getCategories() {
  const query = `SELECT DISTINCT category FROM ${tableName} WHERE is_active = true ORDER BY category`;
  const result = await database.query(query);
  return result.rows.map(row => row.category);
}
async function findByDashboardId(dashboardId) {
  const query = `
    SELECT *
    FROM kpis
    WHERE dashboard_id = $1
      AND is_active = TRUE
    ORDER BY created_at ASC
  `;
  const result = await database.query(query, [dashboardId]);
  return result.rows || [];
}
async function getKPIsNeedingUpdate() {
  const query = `
    SELECT * FROM ${tableName} 
    WHERE is_active = true 
    AND (updated_at IS NULL OR updated_at < NOW() - INTERVAL '1 hour' * refresh_frequency)
  `;
  const result = await database.query(query);
  return result.rows[0];
}

export default {
  createKpiTable,
  createKpi,
  findById,
  findByCategory,
  getAllKPIs,
  updateKpi,
  deleteKPI,
  getKPIsByCategory,
  getCategories,
  findByDashboardId,
  getKPIsNeedingUpdate
}