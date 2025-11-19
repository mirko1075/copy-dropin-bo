import { Router } from 'express';
import healthRoutes from './health.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import { tenantContext } from '../middlewares/tenant-context.middleware';

/**
 * Main Router
 * Aggregates all routes
 */
const router = Router();

// Health routes (no authentication required)
router.use('/health', healthRoutes);

// Apply tenant context middleware to all routes below
router.use(tenantContext);

// API routes (authentication required)
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);

export default router;
