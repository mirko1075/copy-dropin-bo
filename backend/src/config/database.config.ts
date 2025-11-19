import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './env.config';
import { Tenant } from '../entities/tenant.entity';
import { Vendor } from '../entities/vendor.entity';
import { Site } from '../entities/site.entity';
import { ServiceCategory } from '../entities/service-category.entity';
import { ServiceProduct } from '../entities/service-product.entity';
import { User } from '../entities/user.entity';
import { PricingAvailability } from '../entities/pricing-availability.entity';
import { PaymentConfig } from '../entities/payment-config.entity';

/**
 * Database configuration following best practices
 * - Uses TypeORM for ORM
 * - Entities are strongly typed
 * - Migrations support for production
 */
export const dataSourceOptions: DataSourceOptions = {
  type: config.db.type as 'mysql',
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
  synchronize: config.db.synchronize, // Only true in development
  logging: config.db.logging,
  entities: [
    Tenant,
    Vendor,
    Site,
    ServiceCategory,
    ServiceProduct,
    User,
    PricingAvailability,
    PaymentConfig,
  ],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
  charset: 'utf8mb4',
  timezone: 'Z',
  extra: {
    connectionLimit: 10,
  },
};

// Create and export AppDataSource
export const AppDataSource = new DataSource(dataSourceOptions);

/**
 * Initialize database connection
 */
export const initializeDatabase = async (): Promise<DataSource> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established successfully');
    }
    return AppDataSource;
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    throw error;
  }
};

/**
 * Close database connection
 */
export const closeDatabase = async (): Promise<void> => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
};
