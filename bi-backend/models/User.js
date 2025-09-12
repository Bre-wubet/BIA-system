import database from '../config/db.js';

const tableName = 'users';

async function createUserTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await database.query(query);
  console.log('Data sources table created successfully');
}

async function createUser(userData) {
  const {
    username,
    email,
    role
  } = userData;

  const sql = `
    INSERT INTO ${tableName} (username, email, role)
    VALUES ($1, $2, $3)
    RETURNING id, username, role, created_at
  `;

  const values = [
    username,
    email,
    role
  ];

  const result = await database.query(sql, values);
  return result[0];
}

export default {
    createUserTable,
    createUser,
}