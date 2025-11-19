import { Request, Response } from 'express';
import { AppDataSource } from '../config/database.config';
import { ResponseHandler } from '../utils/response';

/**
 * Health Check Controller
 * Provides health and readiness endpoints
 */
export class HealthController {
  /**
   * GET /health
   * Basic health check
   */
  healthCheck(req: Request, res: Response): void {
    ResponseHandler.success(
      res,
      {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      'Service is healthy'
    );
  }

  /**
   * GET /health/ready
   * Readiness check - includes database connectivity
   */
  async readinessCheck(req: Request, res: Response): Promise<void> {
    try {
      // Check database connection
      const isConnected = AppDataSource.isInitialized;

      if (!isConnected) {
        return ResponseHandler.error(
          res,
          'Database not connected',
          503,
          []
        );
      }

      // Optional: Test database query
      await AppDataSource.query('SELECT 1');

      ResponseHandler.success(
        res,
        {
          status: 'READY',
          database: 'connected',
          timestamp: new Date().toISOString(),
        },
        'Service is ready'
      );
    } catch (error) {
      ResponseHandler.error(
        res,
        'Service not ready',
        503,
        []
      );
    }
  }

  /**
   * GET /health/info
   * Service information
   */
  serviceInfo(req: Request, res: Response): void {
    ResponseHandler.success(
      res,
      {
        name: 'Backoffice API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
      },
      'Service information'
    );
  }
}

// Export singleton instance
export const healthController = new HealthController();
