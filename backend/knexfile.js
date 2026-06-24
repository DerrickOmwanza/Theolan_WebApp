import dotenv from 'dotenv';

dotenv.config();

// Support both DATABASE_URL (from Render PostgreSQL) and individual variables
const databaseUrl = process.env.DATABASE_URL;
const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_POOL_MIN, DB_POOL_MAX } = process.env;

// If DATABASE_URL is set, parse it
let connectionConfig;
if (databaseUrl) {
  const url = new URL(databaseUrl);
  connectionConfig = {
    host: url.hostname,
    port: url.port,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1) // Remove leading slash
  };
} else {
  connectionConfig = {
    host: DB_HOST || 'localhost',
    port: DB_PORT || 5432,
    user: DB_USER || 'postgres',
    password: DB_PASSWORD || 'postgres',
    database: DB_NAME || 'theolan_dev'
  };
}

export default {
  development: {
    client: 'pg',
    connection: connectionConfig,
    pool: {
      min: parseInt(DB_POOL_MIN) || 2,
      max: parseInt(DB_POOL_MAX) || 20,
      idleTimeoutMillis: 30000
    },
    migrations: {
      directory: './migrations',
      extension: 'js'
    },
    seeds: {
      directory: './seeds',
      extension: 'js'
    }
  },

  staging: {
    client: 'pg',
    connection: connectionConfig,
    pool: {
      min: parseInt(DB_POOL_MIN) || 5,
      max: parseInt(DB_POOL_MAX) || 20,
      idleTimeoutMillis: 30000
    },
    migrations: {
      directory: './migrations',
      extension: 'js'
    },
    seeds: {
      directory: './seeds',
      extension: 'js'
    }
  },

  // Test environment configuration for unit tests
  test: {
    client: 'pg',
    connection: connectionConfig,
    pool: {
      min: 1,
      max: 5,
      idleTimeoutMillis: 30000
    },
    migrations: {
      directory: './migrations',
      extension: 'js'
    },
    seeds: {
      directory: './seeds',
      extension: 'js'
    }
  },

  production: {
    client: 'pg',
    connection: {
      host: DB_HOST,
      port: DB_PORT || 5432,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      ssl: {
        rejectUnauthorized: false
      }
    },
    pool: {
      min: parseInt(DB_POOL_MIN) || 5,
      max: parseInt(DB_POOL_MAX) || 20,
      idleTimeoutMillis: 30000
    },
    migrations: {
      directory: './migrations',
      extension: 'js'
    },
    seeds: {
      directory: './seeds',
      extension: 'js'
    }
  }
};
