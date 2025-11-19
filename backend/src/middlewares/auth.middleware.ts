import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';
import { UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * JWT Authentication Middleware
 * Currently validates token format but always returns valid
 * Ready for full implementation when needed
 */

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  tenantId: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
}

/**
 * Authenticate JWT token
 * NOTA: Per ora ritorna sempre valido, ma la logica è pronta
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // TEMPORARY: Always return valid for now
    // In production, uncomment the verification below

    // For now, we decode without verification
    const decoded = jwt.decode(token) as JWTPayload | null;

    if (!decoded) {
      // If no token or invalid format, create a default user
      req.user = {
        id: 'temp-user-id',
        email: 'temp@example.com',
        role: 'admin',
        tenantId: 'temp-tenant-id',
        permissions: ['*'],
      };
    } else {
      // Use decoded token data
      req.user = {
        id: decoded.id || 'temp-user-id',
        email: decoded.email || 'temp@example.com',
        role: decoded.role || 'admin',
        tenantId: decoded.tenantId || 'temp-tenant-id',
        permissions: decoded.permissions || ['*'],
      };
    }

    logger.debug(`User authenticated: ${req.user.email} (${req.user.role})`);

    /*
    // FULL IMPLEMENTATION (uncomment when ready to enforce real JWT validation):

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        tenantId: decoded.tenantId,
        permissions: decoded.permissions,
      };

      logger.debug(`User authenticated: ${req.user.email} (${req.user.role})`);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      throw error;
    }
    */

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorization middleware - check user role
 * Following SOLID: Single Responsibility - only checks roles
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      const hasRole = allowedRoles.includes(req.user.role);

      if (!hasRole) {
        throw new UnauthorizedError(
          `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.decode(token) as JWTPayload | null;

    if (decoded) {
      req.user = {
        id: decoded.id || 'temp-user-id',
        email: decoded.email || 'temp@example.com',
        role: decoded.role || 'viewer',
        tenantId: decoded.tenantId || 'temp-tenant-id',
        permissions: decoded.permissions,
      };
    }

    next();
  } catch (error) {
    // Don't fail on error, just continue without user
    next();
  }
};
