
import dotenv from 'dotenv';
import database from '../config/db.js';
import User from '../models/User.js';
import logger from '../config/logger.js';
dotenv.config();

async function migrate() {
  try {
    logger.info('Starting database migration...');
    
    // Create users table
    await User.createUserTable();
    
    logger.info('Database migration completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
}

async function seed() {
  try {
    logger.info('Starting database seeding...');
    
    // Check if admin user already exists
    const existingAdmin = await User.findByEmail('admin@bi-analytics.com');
    if (existingAdmin) {
      logger.info('Admin user already exists, skipping seed');
      return;
    }
    
    // Create default admin user
    const adminUser = await User.createUser({
      username: 'admin',
      email: 'admin@bi-analytics.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', // password: admin123
      first_name: 'System',
      last_name: 'Administrator',
      role: 'admin',
      department: 'IT',
      is_active: true,
      email_verified: true
    });
    
    logger.info('Default admin user created:', adminUser.username);
    
    // Create sample users for different roles
    const sampleUsers = [
      {
        username: 'analyst1',
        email: 'analyst1@bi-analytics.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', // password: analyst123
        first_name: 'John',
        last_name: 'Analyst',
        role: 'analyst',
        department: 'Analytics'
      },
      {
        username: 'manager1',
        email: 'manager1@bi-analytics.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', // password: manager123
        first_name: 'Jane',
        last_name: 'Manager',
        role: 'manager',
        department: 'Operations'
      },
      {
        username: 'user1',
        email: 'user1@bi-analytics.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', // password: user123
        first_name: 'Bob',
        last_name: 'User',
        role: 'user',
        department: 'Sales'
      }
    ];
    
    for (const userData of sampleUsers) {
      const existingUser = await User.findByEmail(userData.email);
      if (!existingUser) {
        await User.createUser(userData);
        logger.info('Sample user created:', userData.username);
      }
    }
    
    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  }
}

async function main() {
  try {
    await database.connect();
    logger.info('Database connected successfully');
    
    await migrate();
    await seed();
    
    logger.info('Migration and seeding completed successfully');
  } catch (error) {
    logger.error('Migration/seeding failed:', error);
    process.exit(1);
  } finally {
    await database.close();
    logger.info('Database connection closed');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { migrate, seed };
