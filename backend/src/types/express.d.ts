import { User } from '../entities/user.entity';

/**
 * Extend Express Request interface to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        tenantId: string;
        permissions?: string[];
      };
      tenantId?: string;
      vendorId?: string;
      siteId?: string;
    }
  }
}
