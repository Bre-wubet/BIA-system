import database from '../config/db.js';

const tableName = 'users';

/**
 * Create users table with enhanced schema
 */
async function createUserTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      department VARCHAR(100),
      is_active BOOLEAN DEFAULT true,
      email_verified BOOLEAN DEFAULT false,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  await database.query(query);
  
  // Create indexes for better performance
  await database.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON ${tableName}(email);`);
  await database.query(`CREATE INDEX IF NOT EXISTS idx_users_username ON ${tableName}(username);`);
  await database.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON ${tableName}(role);`);
  await database.query(`CREATE INDEX IF NOT EXISTS idx_users_active ON ${tableName}(is_active);`);
  
  console.log('Users table created successfully');
}

/**
 * Create a new user
 */
async function createUser(userData) {
  const {
    username,
    email,
    password,
    first_name,
    last_name,
    role = 'user',
    department,
    is_active = true,
    email_verified = false
  } = userData;

  const sql = `
    INSERT INTO ${tableName} (
      username, email, password, first_name, last_name, 
      role, department, is_active, email_verified
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, username, email, first_name, last_name, 
              role, department, is_active, email_verified, 
              created_at, updated_at
  `;

  const values = [
    username,
    email,
    password,
    first_name,
    last_name,
    role,
    department,
    is_active,
    email_verified
  ];

  const result = await database.query(sql, values);
  return result.rows[0];
}

/**
 * Find user by ID
 */
async function findById(id) {
  const sql = `SELECT * FROM ${tableName} WHERE id = $1`;
  const result = await database.query(sql, [id]);
  return result.rows[0] || null;
}

/**
 * Find user by email
 */
async function findByEmail(email) {
  const sql = `SELECT * FROM ${tableName} WHERE email = $1`;
  const result = await database.query(sql, [email]);
  return result.rows[0] || null;
}

/**
 * Find user by username
 */
async function findByUsername(username) {
  const sql = `SELECT * FROM ${tableName} WHERE username = $1`;
  const result = await database.query(sql, [username]);
  return result.rows[0] || null;
}

/**
 * Update user
 */
async function update(id, updateData) {
  const fields = [];
  const values = [];
  let paramCount = 1;

  // Build dynamic update query
  for (const [key, value] of Object.entries(updateData)) {
    if (value !== undefined && key !== 'id') {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  // Always update the updated_at timestamp
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  
  const sql = `
    UPDATE ${tableName} 
    SET ${fields.join(', ')} 
    WHERE id = $${paramCount}
    RETURNING id, username, email, first_name, last_name, 
              role, department, is_active, email_verified, 
              last_login, created_at, updated_at
  `;
  
  values.push(id);
  
  const result = await database.query(sql, values);
  return result.rows[0] || null;
}

/**
 * Update user password
 */
async function updatePassword(id, hashedPassword) {
  const sql = `
    UPDATE ${tableName} 
    SET password = $1, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $2
    RETURNING id, username, email
  `;
  
  const result = await database.query(sql, [hashedPassword, id]);
  return result.rows[0] || null;
}

/**
 * Update last login timestamp
 */
async function updateLastLogin(id) {
  const sql = `
    UPDATE ${tableName} 
    SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1
  `;
  
  await database.query(sql, [id]);
}

/**
 * Deactivate user account
 */
async function deactivate(id) {
  const sql = `
    UPDATE ${tableName} 
    SET is_active = false, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1
    RETURNING id, username, email, is_active
  `;
  
  const result = await database.query(sql, [id]);
  return result.rows[0] || null;
}

/**
 * Activate user account
 */
async function activate(id) {
  const sql = `
    UPDATE ${tableName} 
    SET is_active = true, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1
    RETURNING id, username, email, is_active
  `;
  
  const result = await database.query(sql, [id]);
  return result.rows[0] || null;
}

/**
 * Delete user (soft delete by deactivating)
 */
async function deleteUser(id) {
  return await deactivate(id);
}

/**
 * Get all users with pagination
 */
async function getAllUsers(options = {}) {
  const {
    page = 1,
    limit = 10,
    role = null,
    department = null,
    is_active = null,
    search = null
  } = options;

  let whereConditions = [];
  let values = [];
  let paramCount = 1;

  // Build where conditions
  if (role) {
    whereConditions.push(`role = $${paramCount}`);
    values.push(role);
    paramCount++;
  }

  if (department) {
    whereConditions.push(`department = $${paramCount}`);
    values.push(department);
    paramCount++;
  }

  if (is_active !== null) {
    whereConditions.push(`is_active = $${paramCount}`);
    values.push(is_active);
    paramCount++;
  }

  if (search) {
    whereConditions.push(`(username ILIKE $${paramCount} OR email ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`);
    values.push(`%${search}%`);
    paramCount++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Count total records
  const countSql = `SELECT COUNT(*) as total FROM ${tableName} ${whereClause}`;
  const countResult = await database.query(countSql, values);
  const total = parseInt(countResult.rows[0].total);

  // Get paginated results
  const offset = (page - 1) * limit;
  const sql = `
    SELECT id, username, email, first_name, last_name, 
           role, department, is_active, email_verified, 
           last_login, created_at, updated_at
    FROM ${tableName} 
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;
  
  values.push(limit, offset);
  
  const result = await database.query(sql, values);

  return {
    users: result.rows,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

/**
 * Get user statistics
 */
async function getUserStats() {
  const sql = `
    SELECT 
      COUNT(*) as total_users,
      COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
      COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_this_month,
      COUNT(CASE WHEN last_login >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as active_last_week
    FROM ${tableName}
  `;
  
  const result = await database.query(sql);
  return result.rows[0];
}

/**
 * Get users by role
 */
async function getUsersByRole(role) {
  const sql = `SELECT * FROM ${tableName} WHERE role = $1 AND is_active = true ORDER BY username`;
  const result = await database.query(sql, [role]);
  return result.rows || [];
}

/**
 * Get users by department
 */
async function getUsersByDepartment(department) {
  const sql = `SELECT * FROM ${tableName} WHERE department = $1 AND is_active = true ORDER BY username`;
  const result = await database.query(sql, [department]);
  return result.rows || [];
}

export default {
  createUserTable,
  createUser,
  findById,
  findByEmail,
  findByUsername,
  update,
  updatePassword,
  updateLastLogin,
  deactivate,
  activate,
  deleteUser,
  getAllUsers,
  getUserStats,
  getUsersByRole,
  getUsersByDepartment
};