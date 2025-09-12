import database from '../../../../config/db.js';
import logger from '../../../../config/logger.js';

const DIM_USERS_TABLE = 'dim_users';
export async function createDimUsersTable() {
  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS ${DIM_USERS_TABLE} (
        user_id INT PRIMARY KEY,
        username VARCHAR(100),
        role_id INT,
        distributor_id INT,
        is_active BOOLEAN
      )
    `);
    logger.info(`Table ${DIM_USERS_TABLE} created or already exists.`);
  } catch (error) {
    logger.error('Error creating dim_users table:', error);
    throw error;
  }
}