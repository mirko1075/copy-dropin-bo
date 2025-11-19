import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Tenant Context Middleware
 * Extracts tenant, vendor, and site IDs from headers
 * Aligns with frontend's multi-tenancy interceptor
 */
export const tenantContext = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extract context from headers (sent by frontend interceptor)
    const tenantId = req.headers['x-tenant-id'] as string;
    const vendorId = req.headers['x-vendor-id'] as string;
    const siteId = req.headers['x-site-id'] as string;

    // Attach to request object
    if (tenantId) {
      req.tenantId = tenantId;
    }
    if (vendorId) {
      req.vendorId = vendorId;
    }
    if (siteId) {
      req.siteId = siteId;
    }

    logger.debug(
      `Tenant context: tenant=${tenantId}, vendor=${vendorId}, site=${siteId}`
    );

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Require tenant context - fail if not provided
 */
export const requireTenantContext = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant context required (X-Tenant-Id header)',
        timestamp: new Date().toISOString(),
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
