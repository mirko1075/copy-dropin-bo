import { Router } from 'express';
import { healthController } from '../controllers/health.controller';

/**
 * Health Check Routes
 * No authentication required
 */
const router = Router();

// GET /health - Basic health check
router.get('/', healthController.healthCheck.bind(healthController));

// GET /health/ready - Readiness check
router.get('/ready', healthController.readinessCheck.bind(healthController));

// GET /health/info - Service information
router.get('/info', healthController.serviceInfo.bind(healthController));

export default router;
