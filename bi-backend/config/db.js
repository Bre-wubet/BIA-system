import { Pool } from 'pg';
import { config } from 'dotenv';

config(); // Load environment variables

let pool = null;
let isConnected = false;

// Connect to the PostgreSQL database using pg
const connect = async () => {
  try {
    if (isConnected) {
      return pool;
    }

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in the environment variables');
    }

    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    // Test connection
    await pool.query('SELECT 1');
    isConnected = true;
    return pool;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
};

// Run a query against the database
const query = async (text, params) => {
  try {
    if (!pool) {
      await connect();
    }
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

// Close the database connection
const close = async () => {
  try {
    if (pool) {
      await pool.end();
      isConnected = false;
      pool = null;
    }
  } catch (error) {
    console.error('Error closing the database connection:', error);
    throw error;
  }
};

// Health check
const healthCheck = async () => {
  try {
    if (!pool) {
      await connect();
    }
    const result = await pool.query('SELECT 1');
    return {
      status: result.rowCount > 0 ? 'healthy' : 'unhealthy',
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { status: 'unhealthy' };
  }
};

export default {
  connect,
  query,
  close,
  healthCheck,
};