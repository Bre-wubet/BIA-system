// dataSource.js
import database from '../config/db.js';
import logger from '../config/logger.js';

const tableName = 'data_sources';

async function createDataSourceTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      connection_config JSONB NOT NULL,
      module JSONB NOT NULL,
      status VARCHAR(20) DEFAULT 'inactive',
      query TEXT,
      last_sync TIMESTAMP,
      sync_frequency INTEGER DEFAULT 3600,
      is_active BOOLEAN DEFAULT true,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await database.query(query);
  console.log('Data sources table created successfully');
}

async function createDataSource(dataSourceData) {
  const {
    name,
    type,
    connection_config,
    module,
    status,
    query,
    sync_frequency,
    created_by
  } = dataSourceData;

  const sql = `
    INSERT INTO ${tableName} (name, type, connection_config, module, status, query, sync_frequency, created_by)
    VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, $7, $8)
    RETURNING id, name, type, connection_config, module, status, query, sync_frequency, created_by, created_at, updated_at
  `;

  const values = [
    name,
    type,
    JSON.stringify(connection_config),
    JSON.stringify(module),
    status,
    query,
    sync_frequency,
    created_by
  ];

  const result = await database.query(sql, values);
  return result.rows[0];
}

async function findById(id) {
  const sql = `
    SELECT id, name, type, connection_config, module, status, query, sync_frequency, created_by, created_at, updated_at
    FROM ${tableName}
    WHERE id = $1 AND is_active = true
  `;
  const result = await database.query(sql, [id]);
  return result.rows[0] || null;
}

async function getAllDataSources() {
  const sql = `
    SELECT ds.id, ds.name, ds.type, ds.connection_config, ds.status, ds.module, ds.query,
           ds.sync_frequency, ds.created_by, u.username as created_by_name,
           ds.created_at, ds.updated_at
    FROM ${tableName} ds
    LEFT JOIN users u ON ds.created_by = u.id
    WHERE ds.is_active = true
    ORDER BY ds.name
  `;
  const results = await database.query(sql);
  return results.rows;
}

async function updateDataSource(id, updateData) {
  const {
    name,
    type,
    status,
    connection_config,
    module,
    query,
    sync_frequency
  } = updateData;

  const sql = `
    UPDATE ${tableName}
    SET name = COALESCE($1, name),
        type = COALESCE($2, type),
        status = COALESCE($3, status),
        connection_config = COALESCE($4, connection_config),
        module = COALESCE($5, module),
        query = COALESCE($6, query),
        sync_frequency = COALESCE($7, sync_frequency),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    RETURNING id, name, type, connection_config, module, query, sync_frequency, created_by, created_at, updated_at
  `;

  const values = [
    name,
    type,
    status,
    connection_config ? JSON.stringify(connection_config) : null,
    module ? JSON.stringify(module) : null,
    query,
    sync_frequency,
    id
  ];

  const result = await database.query(sql, values);
  return result.rows[0];
}

async function updateStatus(id, status) {
  const query = `
    UPDATE data_sources 
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  
  try {
    const result = await database.query(query, [status, id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating data source status:', error);
    throw error;
  }
}

async function softDeleteDataSource(id) {
  const sql = `
    UPDATE ${tableName}
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id
  `;
  const result = await database.query(sql, [id]);
  return result.rows[0];
}
// filter data sources by module and type
async function getSourcesByModuleAndType(moduleName, dataSourceType) {
  try {
    const conditions = [`is_active = true`];
    const params = [];
    let idx = 1;

    if (moduleName) {
      conditions.push(`COALESCE(LOWER(module->>'module_name'), '') = LOWER($${idx++})`);
      params.push(moduleName);
    }

    if (dataSourceType) {
      conditions.push(`LOWER(type) = LOWER($${idx++})`);
      params.push(dataSourceType);
    }

    const sql = `
      SELECT id, name, type, module, status, created_at
      FROM ${tableName}
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC
    `;

    const result = await database.query(sql, params);
    return { success: true, data: result.rows };
  } catch (err) {
    console.error("DB Error in getSourcesByModuleAndType:", err);
    return { success: false, data: [], error: err.message };
  }
}

// delete a data source
async function deleteDataSource(id) {
  const sql = `
    DELETE FROM ${tableName}
    WHERE id = $1
    RETURNING id
  `;
  const result = await database.query(sql, [id]);
  return result.rows[0];
}

async function updateLastSync(id) {
  const query = `
    UPDATE data_sources 
    SET last_sync = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  
  try {
    const result = await database.query(query, [id]);
    return result[0];
  } catch (error) {
    console.error('Error updating data source last sync:', error);
    throw error;
  }
}

async function getActiveDataSources() {
  const sql = `
    SELECT id, name, type, connection_config, module, query, sync_frequency, created_by, created_at, updated_at
    FROM ${tableName}
    WHERE is_active = true AND status = 'active'
    ORDER BY name
  `;
  return await database.query(sql);
}

async function getDataSourceTypes() {
  const sql = `SELECT DISTINCT type FROM ${tableName} WHERE is_active = true ORDER BY type`;
  const result = await database.query(sql);
  return result.rows.map(row => row.type);
}

async function getDataSourcesNeedingSync() {
  const query = `
    SELECT * FROM data_sources 
    WHERE is_active = true 
    AND (last_sync IS NULL OR last_sync < NOW() - INTERVAL '1 second' * sync_frequency)
  `;
  
  try {
    const result = await database.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error getting data sources needing sync:', error);
    throw error;
  }
}
async function getSyncStatus() {
  const query = `
    SELECT 
      COUNT(*) as total_sources,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_sources,
      COUNT(CASE WHEN status = 'error' THEN 1 END) as error_sources,
      COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_sources,
      AVG(EXTRACT(EPOCH FROM (NOW() - last_sync))) as avg_sync_age
    FROM data_sources 
    WHERE is_active = true
  `;
  
  try {
    const result = await database.query(query);
    return result;
  } catch (error) {
    console.error('Error getting sync status:', error);
    throw error;
  }
}

export default {
  createDataSourceTable,
  createDataSource,
  findById,
  getAllDataSources,
  updateDataSource,
  updateStatus,
  softDeleteDataSource,
  getSourcesByModuleAndType,
  deleteDataSource,
  getActiveDataSources,
  getDataSourceTypes,
  updateLastSync,
  getDataSourcesNeedingSync,
  getSyncStatus
}