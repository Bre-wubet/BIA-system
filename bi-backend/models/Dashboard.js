import database from '../config/db.js';

const tableName = 'dashboards';

async function createDashboardTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      layout JSONB DEFAULT '{}',
      filters JSONB DEFAULT '{}',
      is_public BOOLEAN DEFAULT false,
      is_default BOOLEAN DEFAULT false,
      refresh_interval INTEGER DEFAULT 300,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await database.query(query);
    console.log('Dashboards table created successfully');
  } catch (error) {
    console.error('Error creating dashboards table:', error);
    throw error;
  }
}

async function createDashboard(dashboardData) {
  const { 
    name, description, user_id, layout, filters,
    is_public, is_default, refresh_interval 
  } = dashboardData;

  const query = `
    INSERT INTO dashboards (name, description, user_id, layout, filters, is_public, is_default, refresh_interval)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  const values = [
    name,
    description,
    user_id,
    JSON.stringify(layout || {}),
    JSON.stringify(filters || {}),
    is_public,
    is_default,
    refresh_interval
  ];

  try {
    const result = await database.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating dashboard:', error);
    throw error;
  }
}

async function findById(id) {
  const query = 'SELECT * FROM dashboards WHERE id = $1';
  try {
    const result = await database.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error finding dashboard by ID:', error);
    throw error;
  }
}

async function findByUserId(userId) {
  const query = `
    SELECT * FROM dashboards 
    WHERE user_id = $1 OR is_public = true
    ORDER BY is_default DESC, updated_at DESC
  `;
  try {
    return await database.query(query, [userId]);
  } catch (error) {
    console.error('Error finding dashboards by user ID:', error);
    throw error;
  }
}

async function getDefaultDashboard(userId) {
  const query = `
    SELECT * FROM dashboards 
    WHERE (user_id = $1 OR is_public = true) AND is_default = true
    LIMIT 1
  `;
  try {
    const result = await database.query(query, [userId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting default dashboard:', error);
    throw error;
  }
}

async function update(id, updateData) {
  const { 
    name, description, layout, filters, 
    is_public, is_default, refresh_interval 
  } = updateData;

  const query = `
    UPDATE dashboards 
    SET name = COALESCE($1, name),
        description = COALESCE($2, description),
        layout = COALESCE($3, layout),
        filters = COALESCE($4, filters),
        is_public = COALESCE($5, is_public),
        is_default = COALESCE($6, is_default),
        refresh_interval = COALESCE($7, refresh_interval),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    RETURNING *
  `;

  const values = [
    name,
    description,
    layout ? JSON.stringify(layout) : null,
    filters ? JSON.stringify(filters) : null,
    is_public,
    is_default,
    refresh_interval,
    id
  ];

  try {
    const result = await database.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating dashboard:', error);
    throw error;
  }
}

async function remove(id) {
  const query = 'DELETE FROM dashboards WHERE id = $1 RETURNING id';
  try {
    const result = await database.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting dashboard:', error);
    throw error;
  }
}

async function duplicate(id, userId, newName) {
  const original = await findById(id);
  if (!original) throw new Error('Dashboard not found');

  const duplicateData = {
    name: newName || `${original.name} (Copy)`,
    description: original.description,
    user_id: userId,
    layout: original.layout,
    filters: original.filters,
    is_public: false,
    is_default: false,
    refresh_interval: original.refresh_interval
  };

  return await createDashboard(duplicateData);
}

async function getPublicDashboards() {
  const query = `
    SELECT d.*, u.username as created_by
    FROM dashboards d
    LEFT JOIN users u ON d.user_id = u.id
    WHERE d.is_public = true
    ORDER BY d.updated_at DESC
  `;
  try {
    return await database.query(query);
  } catch (error) {
    console.error('Error getting public dashboards:', error);
    throw error;
  }
}

async function updateLayout(id, layout) {
  const query = `
    UPDATE dashboards 
    SET layout = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  try {
    const result = await database.query(query, [JSON.stringify(layout), id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating dashboard layout:', error);
    throw error;
  }
}

export default {
  createDashboardTable,
  createDashboard,
  findById,
  findByUserId,
  getDefaultDashboard,
  update,
  remove,
  duplicate,
  getPublicDashboards,
  updateLayout
}