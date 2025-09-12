// widgets.model.js
import database from '../config/db.js';

const tableName = 'widgets';

async function createWidgetTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id SERIAL PRIMARY KEY,
      dashboard_id INTEGER REFERENCES dashboards(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      title VARCHAR,
      kpi_id INTEGER REFERENCES kpis(id),
      data_source_id INTEGER REFERENCES data_sources(id),
      config JSONB,
      position JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      CONSTRAINT check_data_source_or_kpi CHECK (
        (kpi_id IS NOT NULL AND data_source_id IS NULL) OR
        (kpi_id IS NULL AND data_source_id IS NOT NULL)
      )
    );
  `;
  await database.query(query);
  console.log('Widgets table created successfully');
}

async function createWidget(widgetData) {
  const {
    dashboard_id,
    type,
    title,
    kpi_id,
    data_source_id,
    config,
    position
  } = widgetData;

  // Validate either KPI or DataSource is set (exclusive)
  if ((kpi_id && data_source_id) || (!kpi_id && !data_source_id)) {
    throw new Error('Widget must have either kpi_id or data_source_id, but not both.');
  }

  const query = `
    INSERT INTO ${tableName} 
      (dashboard_id, type, title, kpi_id, data_source_id, config, position)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const values = [
    dashboard_id,
    type,
    title || null,
    kpi_id || null,
    data_source_id || null,
    config ? JSON.stringify(config) : null,
    position ? JSON.stringify(position) : null
  ];

  const result = await database.query(query, values);
  return result.rows[0];
}

async function getAllWidgets() {
  const query = `SELECT * FROM ${tableName} WHERE is_active = true`;
  const result = await database.query(query);
  return result.rows || [];
}

async function findById(id) {
  const query = `SELECT * FROM ${tableName} WHERE id = $1 AND is_active = true`;
  const result = await database.query(query, [id]);
  return result.rows[0] || null;
}

// async function findByDashboardId(dashboardId) {
//   const query = `
//     SELECT * FROM ${tableName} 
//     WHERE widgets.dashboard_id = $1 AND is_active = true
//     ORDER BY (position->>'x')::int, (position->>'y')::int
//   `;
//   const result = await database.query(query, [dashboardId]);
//   return result.rows[0];
// }


async function update(id, updateData) {
  const {
    dashboard_id,
    type,
    title,
    kpi_id,
    data_source_id,
    config,
    position,
    is_active
  } = updateData;

  // Validate exclusive KPI or DataSource if these fields provided
  if (
    (kpi_id !== undefined && data_source_id !== undefined) &&
    ((kpi_id && data_source_id) || (!kpi_id && !data_source_id))
  ) {
    throw new Error('Widget must have either kpi_id or data_source_id, but not both.');
  }

  const query = `
    UPDATE ${tableName}
    SET
      dashboard_id = COALESCE($1, dashboard_id),
      type = COALESCE($2, type),
      title = COALESCE($3, title),
      kpi_id = COALESCE($4, kpi_id),
      data_source_id = COALESCE($5, data_source_id),
      config = COALESCE($6, config),
      position = COALESCE($7, position),
      is_active = COALESCE($8, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $9
    RETURNING *
  `;

  const values = [
    dashboard_id || null,
    type || null,
    title || null,
    kpi_id || null,
    data_source_id || null,
    config ? JSON.stringify(config) : null,
    position ? JSON.stringify(position) : null,
    is_active !== undefined ? is_active : null,
    id
  ];

  const result = await database.query(query, values);
  return result.rows[0];
}

async function deleteWidget(id) {
  // Soft delete by is_active flag
  const query = `UPDATE ${tableName} SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id`;
  const result = await database.query(query, [id]);
  return result.rows[0];
}

async function updateConfig(id, config) {
  const query = `
    UPDATE ${tableName}
    SET config = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  const result = await database.query(query, [JSON.stringify(config), id]);
  return result.rows[0];
}

async function updatePosition(id, position) {
  const query = `
    UPDATE ${tableName}
    SET position = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  const result = await database.query(query, [JSON.stringify(position), id]);
  return result[0];
}

async function deactivateWidgetsByDashboard(dashboardId) {
  const query = `
    UPDATE ${tableName}
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE dashboard_id = $1 AND is_active = true
  `;
  const result = await database.query(query, [dashboardId]);
  return result.length; // rows updated count
}

async function reactivateWidget(id) {
  const query = `
    UPDATE ${tableName}
    SET is_active = true, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const result = await database.query(query, [id]);
  return result[0];
}

export default {
  createWidgetTable,
  createWidget,
  getAllWidgets,
  findById,
  update,
  deleteWidget,
  updateConfig,
  updatePosition,
  deactivateWidgetsByDashboard,
  reactivateWidget
}
