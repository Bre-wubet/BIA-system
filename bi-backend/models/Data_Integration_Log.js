// dataIntegrationLog.model.js
import database from '../config/db.js';
import logger from '../config/logger.js';
const tableName = 'data_integration_log';

async function createDataLogTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id SERIAL PRIMARY KEY,
      source_system VARCHAR(100) NOT NULL,
      data_source_id INTEGER REFERENCES data_sources(id),
      record_count INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'pending',
      run_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      error_log TEXT,
      duration_seconds NUMERIC(10,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await database.query(query);
  console.log('Data Integration Log table created successfully');
}

export async function createDataLog(logData) {
  const {
    source_system,
    data_source_id,
    record_count = 0,
    status = 'pending',
    run_timestamp = new Date(),
    error_log = null,
    duration_seconds = null
  } = logData;

  const query = `
    INSERT INTO ${tableName} 
      (source_system, data_source_id, record_count, status, run_timestamp, error_log, duration_seconds, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    RETURNING *
  `;

  const values = [
    source_system,
    data_source_id,
    record_count,
    status,
    run_timestamp,
    error_log,
    duration_seconds
  ];

  try {
    const result = await database.query(query, values);
    logger.info(`Data log created for data source ${data_source_id}`, { record_count, status });
    return result.rows[0];
  } catch (error) {
    logger.error('Failed to create data log:', error);
    throw error;
  }
}

async function findById(id) {
  const query = `SELECT * FROM ${tableName} WHERE id = $1`;
  const result = await database.query(query, [id]);
  return result[0] || null;
}

async function findBySourceSystem(sourceSystem) {
  const query = `
    SELECT * FROM ${tableName} 
    WHERE source_system = $1
    ORDER BY run_timestamp DESC
  `;
  return await database.query(query, [sourceSystem]);
}

async function findByStatus(status) {
  const query = `
    SELECT * FROM ${tableName} 
    WHERE status = $1
    ORDER BY run_timestamp DESC
  `;
  return await database.query(query, [status]);
}

async function updateStatusAndLog(id, status, errorLog = null, durationSeconds = null) {
  const query = `
    UPDATE ${tableName}
    SET status = $1,
        error_log = COALESCE($2, error_log),
        duration_seconds = COALESCE($3, duration_seconds),
        run_timestamp = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *
  `;
  const result = await database.query(query, [status, errorLog, durationSeconds, id]);
  return result[0];
}

async function getRecentLogs(limit = 15) {
  const query = `
    SELECT * FROM ${tableName} 
    ORDER BY run_timestamp DESC
    LIMIT $1
  `;
  return await database.query(query, [limit]);
}

async function deleteLog(id) {
  const query = `DELETE FROM ${tableName} WHERE id = $1 RETURNING id`;
  const result = await database.query(query, [id]);
  return result[0];
}


async function getIntegrationStats() {
  const query = `
    SELECT 
      source_system,
      COUNT(*) AS total_runs,
      COUNT(CASE WHEN status = 'success' THEN 1 END) AS success_count,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) AS failure_count,
      AVG(duration_seconds) AS avg_duration_seconds,
      MAX(run_timestamp) AS last_run
    FROM ${tableName}
    GROUP BY source_system
    ORDER BY total_runs DESC
  `;
  return await database.query(query);
}

async function getAvgDurationByDataType() {
  const query = `
    SELECT data_type,
           COUNT(*) AS total_runs,
           AVG(duration_seconds) AS avg_duration_seconds
    FROM ${tableName}
    GROUP BY data_type
    ORDER BY avg_duration_seconds DESC NULLS LAST
  `;
  return await database.query(query);
}


async function getRecentFailures(limit = 10) {
  const query = `
    SELECT * FROM ${tableName}
    WHERE status = 'failed'
    ORDER BY run_timestamp DESC
    LIMIT $1
  `;
  return await database.query(query, [limit]);
}

async function getLogsByDateRange(startDate, endDate) {
  const query = `
    SELECT * FROM ${tableName}
    WHERE run_timestamp BETWEEN $1 AND $2
    ORDER BY run_timestamp DESC
  `;
  return await database.query(query, [startDate, endDate]);
}

async function findStaleIntegrations(thresholdHours = 24) {
  const query = `
    SELECT source_system, MAX(run_timestamp) AS last_run
    FROM ${tableName}
    WHERE status = 'success'
    GROUP BY source_system
    HAVING MAX(run_timestamp) < NOW() - INTERVAL '${thresholdHours} hours'
  `;
  return await database.query(query);
}
async function getSyncHistoryByDataSourceId (dataSourceId, page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  const query = `
    SELECT id, source_system, data_source_id, record_count, status, run_timestamp, duration_seconds
    FROM ${tableName}
    WHERE data_source_id = $1
    ORDER BY run_timestamp DESC
    LIMIT $2 OFFSET $3
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM ${tableName}
    WHERE data_source_id = $1
  `;

  const [dataResult, countResult] = await Promise.all([
    database.query(query, [dataSourceId, limit, offset]),
    database.query(countQuery, [dataSourceId])
  ]);

  const total = parseInt(countResult.rows[0]?.total || 0, 10);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: dataResult.rows
  };
};
async function getPaginatedLogs({ page = 1, limit = 10, filters = {}, sortBy = 'run_timestamp', order = 'DESC' }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (filters.status) {
    conditions.push(`status = $${paramIndex++}`);
    values.push(filters.status);
  }

  if (filters.source_system) {
    conditions.push(`source_system = $${paramIndex++}`);
    values.push(filters.source_system);
  }

  if (filters.dateFrom && filters.dateTo) {
    conditions.push(`run_timestamp BETWEEN $${paramIndex++} AND $${paramIndex++}`);
    values.push(filters.dateFrom, filters.dateTo);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // ✅ Select only specific columns
  const query = `
    SELECT id, source_system, data_source_id, record_count, status, run_timestamp, duration_seconds
    FROM ${tableName}
    ${whereClause}
    ORDER BY ${sortBy} ${order}
    LIMIT $${paramIndex++} OFFSET $${paramIndex}
  `;

  values.push(limit, offset);

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM ${tableName}
    ${whereClause}
  `;

  const [data, countResult] = await Promise.all([
    database.query(query, values),
    database.query(countQuery, values.slice(0, values.length - 2))
  ]);

  const total = countResult[0]?.total || 0;

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: data.rows
  };
}

async function deleteOldLogs(beforeDate) {
  const query = `
    DELETE FROM ${tableName}
    WHERE run_timestamp < $1
    RETURNING id
  `;
  return await database.query(query, [beforeDate]);
}

export default {
  createDataLogTable,
  findById,
  findBySourceSystem,
  findByStatus,
  updateStatusAndLog,
  getRecentLogs,
  deleteLog,
  getIntegrationStats,
  getAvgDurationByDataType,
  getRecentFailures,
  getLogsByDateRange,
  getSyncHistoryByDataSourceId,
  findStaleIntegrations,
  getPaginatedLogs,
  deleteOldLogs
}