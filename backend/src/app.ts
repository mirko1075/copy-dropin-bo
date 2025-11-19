import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import { config } from './config/env.config';
import { logger } from './utils/logger';
import routes from './routes';

// Security middlewares
import {
  helmetMiddleware,
  corsMiddleware,
  rateLimiter,
  noSqlInjectionProtection,
  parameterPollutionProtection,
  compressionMiddleware,
  securityHeaders,
  sanitizeRequest,
} from './middlewares/security.middleware';

// Error handling middlewares
import {
  errorHandler,
  notFoundHandler,
} from './middlewares/error.middleware';

/**
 * Express Application Setup
 * Following best practices:
 * - Security middlewares (Helmet, CORS, Rate Limiting)
 * - Request parsing and sanitization
 * - Logging
 * - Modular routing
 * - Centralized error handling
 */
export class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize middlewares
   */
  private initializeMiddlewares(): void {
    // Security headers
    this.app.use(securityHeaders);

    // Helmet - Security headers
    this.app.use(helmetMiddleware);

    // CORS
    this.app.use(corsMiddleware);

    // Compression
    this.app.use(compressionMiddleware);

    // Rate limiting
    this.app.use(rateLimiter);

    // Body parser
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // NoSQL injection protection
    this.app.use(noSqlInjectionProtection);

    // HTTP parameter pollution protection
    this.app.use(parameterPollutionProtection);

    // Request sanitization
    this.app.use(sanitizeRequest);

    // Request logging
    this.app.use((req: Request, res: Response, next) => {
      logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
      next();
    });

    logger.info('Middlewares initialized');
  }

  /**
   * Initialize routes
   */
  private initializeRoutes(): void {
    // Root endpoint
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        success: true,
        message: 'Backoffice API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    });

    // API routes
    this.app.use(config.apiPrefix, routes);

    logger.info('Routes initialized');
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);

    logger.info('Error handling initialized');
  }

  /**
   * Get Express application instance
   */
  public getApp(): Application {
    return this.app;
  }
}

// Export app instance
export default new App().app;
