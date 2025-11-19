import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate, body, param } from '../middlewares/validation.middleware';

/**
 * Category Routes
 * All routes require authentication
 */
const router = Router();

/**
 * Validation rules
 */
const createCategoryValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ max: 100 })
    .withMessage('Code must be at most 100 characters'),
  body('nameIt')
    .trim()
    .notEmpty()
    .withMessage('Italian name is required')
    .isLength({ max: 255 })
    .withMessage('Name must be at most 255 characters'),
  body('nameEn')
    .trim()
    .notEmpty()
    .withMessage('English name is required')
    .isLength({ max: 255 })
    .withMessage('Name must be at most 255 characters'),
  body('nameDe')
    .trim()
    .notEmpty()
    .withMessage('German name is required')
    .isLength({ max: 255 })
    .withMessage('Name must be at most 255 characters'),
  body('nameFr')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Name must be at most 255 characters'),
  body('nameEs')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Name must be at most 255 characters'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'archived'])
    .withMessage('Status must be active, inactive, or archived'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a positive integer'),
];

const updateCategoryValidation = [
  param('id').isUUID().withMessage('Invalid category ID'),
  body('code')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Code must be at most 100 characters'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'archived'])
    .withMessage('Status must be active, inactive, or archived'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a positive integer'),
];

const updateStatusValidation = [
  param('id').isUUID().withMessage('Invalid category ID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['active', 'inactive', 'archived'])
    .withMessage('Status must be active, inactive, or archived'),
];

/**
 * Routes
 */

// GET /categories - Get all categories
router.get('/', authenticate, categoryController.getAllCategories);

// GET /categories/active - Get active categories
router.get('/active', authenticate, categoryController.getActiveCategories);

// GET /categories/code/:code - Get category by code
router.get('/code/:code', authenticate, categoryController.getCategoryByCode);

// GET /categories/:id - Get category by ID
router.get(
  '/:id',
  authenticate,
  validate([param('id').isUUID().withMessage('Invalid category ID')]),
  categoryController.getCategoryById
);

// POST /categories - Create category (Admin, Manager only)
router.post(
  '/',
  authenticate,
  authorize('admin', 'manager'),
  validate(createCategoryValidation),
  categoryController.createCategory
);

// PUT /categories/:id - Update category (Admin, Manager, Editor)
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'manager', 'editor'),
  validate(updateCategoryValidation),
  categoryController.updateCategory
);

// PATCH /categories/:id/status - Update status (Admin, Manager)
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin', 'manager'),
  validate(updateStatusValidation),
  categoryController.updateCategoryStatus
);

// DELETE /categories/:id - Delete category (Admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate([param('id').isUUID().withMessage('Invalid category ID')]),
  categoryController.deleteCategory
);

export default router;
