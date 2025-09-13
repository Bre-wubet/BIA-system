import database from '../config/db.js';

const tableName = 'exports';

async function createExportTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id SERIAL PRIMARY KEY,
      job_id VARCHAR(255) UNIQUE NOT NULL,
      user_id INTEGER REFERENCES users(id),
      data_type VARCHAR(100) NOT NULL,
      data_id INTEGER,
      format VARCHAR(20) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      filename VARCHAR(255),
      file_path VARCHAR(500),
      file_size BIGINT,
      filters JSONB DEFAULT '{}',
      options JSONB DEFAULT '{}',
      error_message TEXT,
      started_at TIMESTAMP,
      completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await database.query(query);
  console.log('Exports table created successfully');
}

async function createExport(exportData) {
  const {
    jobId,
    userId,
    dataType,
    dataId,
    format,
    status = 'pending',
    filename,
    filePath,
    fileSize,
    filters = {},
    options = {}
  } = exportData;

  const query = `
    INSERT INTO ${tableName} (
      job_id, user_id, data_type, data_id, format, status, 
      filename, file_path, file_size, filters, options
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;

  const values = [
    jobId,
    userId,
    dataType,
    dataId || null,
    format,
    status,
    filename || null,
    filePath || null,
    fileSize || null,
    JSON.stringify(filters),
    JSON.stringify(options)
  ];

  const result = await database.query(query, values);
  return result[0];
}

async function findById(id) {
  const query = `SELECT * FROM ${tableName} WHERE id = $1`;
  const result = await database.query(query, [id]);
  return result[0] || null;
}

async function findByJobId(jobId) {
  const query = `SELECT * FROM ${tableName} WHERE job_id = $1`;
  const result = await database.query(query, [jobId]);
  return result[0] || null;
}

async function getAllExports({ userId, status, dataType, format, limit = 50, offset = 0 } = {}) {
  let query = `
    SELECT e.*, u.username as user_name
    FROM ${tableName} e
    LEFT JOIN users u ON e.user_id = u.id
    WHERE 1=1
  `;
  const values = [];
  let paramIndex = 1;

  if (userId) {
    query += ` AND e.user_id = $${paramIndex++}`;
    values.push(userId);
  }

  if (status) {
    query += ` AND e.status = $${paramIndex++}`;
    values.push(status);
  }

  if (dataType) {
    query += ` AND e.data_type = $${paramIndex++}`;
    values.push(dataType);
  }

  if (format) {
    query += ` AND e.format = $${paramIndex++}`;
    values.push(format);
  }

  query += ` ORDER BY e.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  values.push(parseInt(limit), parseInt(offset));

  return await database.query(query, values);
}

async function updateExport(id, updateData) {
  const {
    status,
    filename,
    filePath,
    fileSize,
    errorMessage,
    startedAt,
    completedAt
  } = updateData;

  const query = `
    UPDATE ${tableName} 
    SET status = COALESCE($1, status),
        filename = COALESCE($2, filename),
        file_path = COALESCE($3, file_path),
        file_size = COALESCE($4, file_size),
        error_message = COALESCE($5, error_message),
        started_at = COALESCE($6, started_at),
        completed_at = COALESCE($7, completed_at),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    RETURNING *
  `;

  const values = [
    status,
    filename,
    filePath,
    fileSize,
    errorMessage,
    startedAt,
    completedAt,
    id
  ];

  const result = await database.query(query, values);
  return result[0];
}

async function updateStatus(jobId, status, additionalData = {}) {
  const { filename, filePath, fileSize, errorMessage } = additionalData;
  
  const updateFields = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
  const values = [status];
  let paramIndex = 2;

  if (filename) {
    updateFields.push(`filename = $${paramIndex++}`);
    values.push(filename);
  }

  if (filePath) {
    updateFields.push(`file_path = $${paramIndex++}`);
    values.push(filePath);
  }

  if (fileSize) {
    updateFields.push(`file_size = $${paramIndex++}`);
    values.push(fileSize);
  }

  if (errorMessage) {
    updateFields.push(`error_message = $${paramIndex++}`);
    values.push(errorMessage);
  }

  if (status === 'processing') {
    updateFields.push(`started_at = CURRENT_TIMESTAMP`);
  } else if (status === 'completed' || status === 'failed') {
    updateFields.push(`completed_at = CURRENT_TIMESTAMP`);
  }

  values.push(jobId);

  const query = `
    UPDATE ${tableName} 
    SET ${updateFields.join(', ')}
    WHERE job_id = $${paramIndex}
    RETURNING *
  `;

  const result = await database.query(query, values);
  return result[0];
}

async function deleteExport(id) {
  const query = `DELETE FROM ${tableName} WHERE id = $1 RETURNING id`;
  const result = await database.query(query, [id]);
  return result[0];
}

async function getExportStats({ userId, timeRange = '30d' } = {}) {
  let dateFilter = '';
  if (timeRange === '7d') {
    dateFilter = "AND created_at > NOW() - INTERVAL '7 days'";
  } else if (timeRange === '30d') {
    dateFilter = "AND created_at > NOW() - INTERVAL '30 days'";
  } else if (timeRange === '90d') {
    dateFilter = "AND created_at > NOW() - INTERVAL '90 days'";
  }

  const userFilter = userId ? `AND user_id = ${userId}` : '';

  const query = `
    SELECT 
      COUNT(*) as total_exports,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_exports,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_exports,
      COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_exports,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_exports,
      AVG(CASE WHEN completed_at IS NOT NULL AND started_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (completed_at - started_at)) END) as avg_processing_time_seconds,
      SUM(file_size) as total_file_size,
      COUNT(CASE WHEN format = 'pdf' THEN 1 END) as pdf_exports,
      COUNT(CASE WHEN format = 'csv' THEN 1 END) as csv_exports,
      COUNT(CASE WHEN format = 'xlsx' THEN 1 END) as excel_exports,
      COUNT(CASE WHEN format = 'json' THEN 1 END) as json_exports
    FROM ${tableName} 
    WHERE 1=1 ${dateFilter} ${userFilter}
  `;

  const result = await database.query(query);
  return result[0];
}

async function getExportsByType({ timeRange = '30d' } = {}) {
  let dateFilter = '';
  if (timeRange === '7d') {
    dateFilter = "AND created_at > NOW() - INTERVAL '7 days'";
  } else if (timeRange === '30d') {
    dateFilter = "AND created_at > NOW() - INTERVAL '30 days'";
  } else if (timeRange === '90d') {
    dateFilter = "AND created_at > NOW() - INTERVAL '90 days'";
  }

  const query = `
    SELECT 
      data_type,
      format,
      COUNT(*) as count,
      AVG(CASE WHEN completed_at IS NOT NULL AND started_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (completed_at - started_at)) END) as avg_processing_time_seconds
    FROM ${tableName} 
    WHERE status = 'completed' ${dateFilter}
    GROUP BY data_type, format
    ORDER BY count DESC
  `;

  return await database.query(query);
}

async function cleanupOldExports(daysOld = 30) {
  const query = `
    DELETE FROM ${tableName} 
    WHERE created_at < NOW() - INTERVAL '${daysOld} days'
    AND status IN ('completed', 'failed')
    RETURNING id, file_path
  `;

  const result = await database.query(query);
  
  // Delete physical files
  result.forEach(row => {
    if (row.file_path) {
      try {
        const fs = require('fs');
        if (fs.existsSync(row.file_path)) {
          fs.unlinkSync(row.file_path);
        }
      } catch (error) {
        console.error(`Error deleting file ${row.file_path}:`, error);
      }
    }
  });

  return result.length;
}

export default {
  createExportTable,
  createExport,
  findById,
  findByJobId,
  getAllExports,
  updateExport,
  updateStatus,
  deleteExport,
  getExportStats,
  getExportsByType,
  cleanupOldExports
};
