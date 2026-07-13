const { Pool } = require('pg');
require('dotenv').config();

// Create connection config from environment variables
const poolConfig = {
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'botanico',
  port: parseInt(process.env.PGPORT || '5432', 10),
};

// Use DATABASE_URL if available (e.g. Supabase, Neon)
const connectionString = process.env.DATABASE_URL;
const isProd = process.env.NODE_ENV === 'production';

const pool = new Pool(
  connectionString 
    ? { 
        connectionString, 
        ssl: isProd ? { rejectUnauthorized: false } : false 
      }
    : { 
        ...poolConfig,
        ssl: isProd ? { rejectUnauthorized: false } : false 
      }
);

// Helper function for quick queries
const query = (text, params) => pool.query(text, params);

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log(`🐘 PostgreSQL Connected: ${connectionString ? 'via Connection URL' : `${poolConfig.host}:${poolConfig.port}/${poolConfig.database}`}`);
    client.release();
    return pool;
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error.message);
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

// Attach helpers to connectDB function for easy imports
connectDB.query = query;
connectDB.pool = pool;

module.exports = connectDB;
