// Import environment variables from .env file
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Database configuration object
const dbConfig = {
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_DB,
  dialect: process.env.DB_DIALECT,
  port: process.env.DB_PORT,
  pool: {
    max: 10,
    // Keep connections warm. Opening a new one costs a TLS handshake plus
    // auth against Supabase (~1.5-2s from here), so idling them out after
    // 10s meant nearly every request paid that cost.
    min: 2,
    acquire: 30000,
    idle: 300000,
    evict: 600000,
  },
  ssl: process.env.DB_SSL === 'true',
};

// Export the configuration object as default
export default dbConfig;
