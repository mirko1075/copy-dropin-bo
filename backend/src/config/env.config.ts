import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Centralized configuration management
 * All environment variables are validated and typed here
 * Following Single Responsibility Principle
 */
export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || '/backoffice/v1',

  // Database
  db: {
    type: process.env.DB_TYPE || 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'backoffice_db',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    fileError: process.env.LOG_FILE_ERROR || 'logs/error.log',
    fileCombined: process.env.LOG_FILE_COMBINED || 'logs/combined.log',
  },
} as const;

/**
 * Validate required environment variables
 */
export const validateConfig = (): void => {
  const requiredVars = [
    'JWT_SECRET',
    'DB_HOST',
    'DB_DATABASE',
  ];

  const missing = requiredVars.filter(
    (varName) => !process.env[varName] || process.env[varName] === 'change-this-secret-key'
  );

  if (missing.length > 0 && config.nodeEnv === 'production') {
    throw new Error(
      `Missing or default required environment variables: ${missing.join(', ')}`
    );
  }
};
