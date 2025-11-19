import 'reflect-metadata';
import app from './app';
import { config, validateConfig } from './config/env.config';
import { initializeDatabase, closeDatabase } from './config/database.config';
import { logger } from './utils/logger';
import http from 'http';

/**
 * Server Entry Point
 * Initializes database, starts HTTP server, and handles graceful shutdown
 */
class Server {
  private server?: http.Server;

  /**
   * Start the server
   */
  async start(): Promise<void> {
    try {
      // Validate configuration
      logger.info('Validating configuration...');
      validateConfig();

      // Initialize database
      logger.info('Initializing database connection...');
      await initializeDatabase();

      // Start HTTP server
      const port = config.port;
      this.server = app.listen(port, () => {
        logger.info(`🚀 Server is running on port ${port}`);
        logger.info(`📝 Environment: ${config.nodeEnv}`);
        logger.info(`🔗 API URL: http://localhost:${port}${config.apiPrefix}`);
        logger.info(`💚 Health check: http://localhost:${port}${config.apiPrefix}/health`);
      });

      // Handle graceful shutdown
      this.setupGracefulShutdown();
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Setup graceful shutdown
   */
  private setupGracefulShutdown(): void {
    // Handle SIGTERM
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      await this.shutdown();
    });

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received: closing HTTP server');
      await this.shutdown();
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      this.shutdown().then(() => process.exit(1));
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.shutdown().then(() => process.exit(1));
    });
  }

  /**
   * Graceful shutdown
   */
  private async shutdown(): Promise<void> {
    try {
      // Close HTTP server
      if (this.server) {
        await new Promise<void>((resolve, reject) => {
          this.server!.close((err) => {
            if (err) {
              reject(err);
            } else {
              logger.info('HTTP server closed');
              resolve();
            }
          });
        });
      }

      // Close database connection
      await closeDatabase();

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Start server
const server = new Server();
server.start();
