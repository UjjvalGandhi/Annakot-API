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
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  ssl: process.env.DB_SSL === 'true',
};

// Export the configuration object as default
export default dbConfig;
