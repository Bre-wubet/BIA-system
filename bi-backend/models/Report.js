import database from '../config/db.js';

const tableName = 'reports';

async function createReportTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      involved_modules VARCHAR,
      query_config JSONB NOT NULL,
      schedule VARCHAR(100),
      format VARCHAR(20) DEFAULT 'pdf',
      recipients JSONB DEFAULT '[]',
      last_generated_at TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await database.query(query);
  console.log('Reports table created successfully');
}

async function createReport(reportData) {
  const { 
    name, 
    type, 
    category, 
    involved_modules,
    query_config, 
    schedule, 
    format, 
    recipients, 
    created_by 
  } = reportData;

  const query = `
    INSERT INTO ${tableName} (name, type, category, involved_modules, query_config, schedule, format, recipients, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const values = [
    name,
    type,
    category || null,
    involved_modules || null,
    JSON.stringify(query_config),
    schedule || null,
    format || 'pdf',
    JSON.stringify(recipients || []),
    created_by
  ];

  const result = await database.query(query, values);
  return result.rows[0];
}

async function findById(id) {
  const query = `SELECT * FROM ${tableName} WHERE id = $1 AND is_active = true`;
  const result = await database.query(query, [id]);
  return result.rows[0] || null;
}

async function findByType(type) {
  const query = `SELECT * FROM ${tableName} WHERE type = $1 AND is_active = true ORDER BY name`;
  return await database.query(query, [type]);
}

async function findByCategory(category) {
  const query = `SELECT * FROM ${tableName} WHERE category = $1 AND is_active = true ORDER BY name`;
  return await database.query(query, [category]);
}

async function getAllReports() {
  const query = `
    SELECT r.*, u.username as created_by_name
    FROM ${tableName} r
    LEFT JOIN users u ON r.created_by = u.id
    WHERE r.is_active = true
    ORDER BY r.category, r.name
  `;
  return await database.query(query);
}

async function updateReport(id, updateData) {
  const { 
    name, 
    type, 
    category, 
    involved_modules,
    query_config, 
    schedule, 
    format, 
    recipients 
  } = updateData;

  const query = `
    UPDATE ${tableName} 
    SET name = COALESCE($1, name),
        type = COALESCE($2, type),
        category = COALESCE($3, category),
        involved_modules = COALESCE($4, involved_modules),
        query_config = COALESCE($5, query_config),
        schedule = COALESCE($6, schedule),
        format = COALESCE($7, format),
        recipients = COALESCE($8, recipients),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $9
    RETURNING *
  `;

  const values = [
    name,
    type,
    category || null,
    involved_modules || null,
    query_config ? JSON.stringify(query_config) : null,
    schedule || null,
    format || null,
    recipients ? JSON.stringify(recipients) : null,
    id
  ];

  const result = await database.query(query, values);
  return result.rows[0];
}

async function deleteReport(id) {
  const query = `UPDATE ${tableName} SET is_active = false WHERE id = $1 RETURNING id`;
  const result = await database.query(query, [id]);
  return result.rows[0];
}

async function getScheduledReports() {
  const query = `
    SELECT * FROM ${tableName} 
    WHERE is_active = true 
    AND schedule IS NOT NULL 
    AND schedule != ''
    ORDER BY name
  `;
  return await database.query(query);
}
async function getReportTypes() {
  const query = `SELECT DISTINCT type FROM ${tableName} WHERE is_active = true ORDER BY type`;
  const result = await database.query(query);
  return result.map(row => row.type);
}

async function getCategories() {
  const query = `SELECT DISTINCT category FROM ${tableName} WHERE is_active = true ORDER BY category`;
  const result = await database.query(query);
  return result.map(row => row.category);
}

async function duplicate(id, createdBy, newName) {
  const original = await findById(id);
  if (!original) throw new Error('Report not found');

  const duplicateData = {
    name: newName || `${original.name} (Copy)`,
    type: original.type,
    category: original.category,
    involved_modules: original.involved_modules,
    query_config: original.query_config,
    schedule: null,
    format: original.format,
    recipients: [],
    created_by: createdBy
  };

  return await create(duplicateData);
}

async function updateLastGeneratedAt(id) {
  const query = `
    UPDATE ${tableName}
    SET last_generated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const result = await database.query(query, [id]);
  return result.rows[0];
}

async function updateSchedule(id, schedule) {
  const query = `
    UPDATE ${tableName} 
    SET schedule = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  const result = await database.query(query, [schedule, id]);
  return result.rows[0];
}

async function updateRecipients(id, recipients) {
  const query = `
    UPDATE ${tableName} 
    SET recipients = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  const result = await database.query(query, [JSON.stringify(recipients), id]);
  return result.rows[0];
}

async function getStats() {
  const query = `
    SELECT 
      COUNT(*) as total_reports,
      COUNT(CASE WHEN schedule IS NOT NULL THEN 1 END) as scheduled_reports,
      COUNT(CASE WHEN last_generated_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_reports,
      COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_reports
    FROM ${tableName} 
    WHERE is_active = true
  `;
  const result = await database.query(query);
  return result.rows[0];
}

async function getTemplates({ category, role } = {}) {
  let query = `
    SELECT * FROM ${tableName} 
    WHERE is_active = true 
    AND is_template = true
  `;
  const values = [];
  let paramIndex = 1;

  if (category) {
    query += ` AND category = $${paramIndex++}`;
    values.push(category);
  }

  if (role) {
    query += ` AND (allowed_roles IS NULL OR allowed_roles @> $${paramIndex++})`;
    values.push(JSON.stringify([role]));
  }

  query += ` ORDER BY name`;
  return await database.query(query, values);
}

async function getTemplate(id) {
  const query = `SELECT * FROM ${tableName} WHERE id = $1 AND is_active = true AND is_template = true`;
  const result = await database.query(query, [id]);
  return result.rows[0] || null;
}

async function updateSharing(id, shareOptions) {
  const { isPublic, allowDownload, expiresAt, password } = shareOptions;
  
  const query = `
    UPDATE ${tableName} 
    SET is_public = $1,
        allow_download = $2,
        expires_at = $3,
        share_password = $4,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *
  `;
  
  const result = await database.query(query, [
    isPublic || false,
    allowDownload || false,
    expiresAt || null,
    password || null,
    id
  ]);
  
  return result.rows[0];
}

export default {
  createReportTable,
  createReport,
  findById,
  findByType,
  findByCategory,
  getAllReports,
  updateReport,
  deleteReport,
  getScheduledReports,
  getReportTypes,
  getCategories,
  duplicate,
  updateLastGeneratedAt,
  updateSchedule,
  updateRecipients,
  getStats,
  getTemplates,
  getTemplate,
  updateSharing
}