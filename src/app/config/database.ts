import { Pool } from 'pg';
import { config } from './env';

export const pool = new Pool({
  connectionString: config.database.url,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

export default pool;