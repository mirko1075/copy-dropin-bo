import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate, body, param, query } from '../middlewares/validation.middleware';

/**
 * Product Routes
 * All routes require authentication
 */
const router = Router();

/**
 * Validation rules
 */
const createProductValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ max: 100 })
    .withMessage('Code must be at most 100 characters'),
  body('categoryId')
    .notEmpty()
    .withMessage('Category ID is required')
    .isUUID()
    .withMessage('Invalid category ID'),
  body('siteId')
    .optional()
    .isUUID()
    .withMessage('Invalid site ID'),
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
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  body('basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive integer'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a positive integer'),
];

const updateProductValidation = [
  param('id').isUUID().withMessage('Invalid product ID'),
  body('code')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Code must be at most 100 characters'),
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  body('basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive integer'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a positive integer'),
];

const updateStatusValidation = [
  param('id').isUUID().withMessage('Invalid product ID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
];

/**
 * Routes
 */

// GET /products/search - Search products
router.get(
  '/search',
  authenticate,
  validate([query('q').notEmpty().withMessage('Search term is required')]),
  productController.searchProducts
);

// GET /products/category/:categoryId - Get products by category
router.get(
  '/category/:categoryId',
  authenticate,
  validate([param('categoryId').isUUID().withMessage('Invalid category ID')]),
  productController.getProductsByCategory
);

// GET /products/site/:siteId - Get products by site
router.get(
  '/site/:siteId',
  authenticate,
  validate([param('siteId').isUUID().withMessage('Invalid site ID')]),
  productController.getProductsBySite
);

// GET /products - Get all products
router.get('/', authenticate, productController.getAllProducts);

// GET /products/:id - Get product by ID
router.get(
  '/:id',
  authenticate,
  validate([param('id').isUUID().withMessage('Invalid product ID')]),
  productController.getProductById
);

// POST /products - Create product (Admin, Manager, Editor)
router.post(
  '/',
  authenticate,
  authorize('admin', 'manager', 'editor'),
  validate(createProductValidation),
  productController.createProduct
);

// PUT /products/:id - Update product (Admin, Manager, Editor)
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'manager', 'editor'),
  validate(updateProductValidation),
  productController.updateProduct
);

// PATCH /products/:id/status - Update status (Admin, Manager)
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin', 'manager'),
  validate(updateStatusValidation),
  productController.updateProductStatus
);

// DELETE /products/:id - Delete product (Admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate([param('id').isUUID().withMessage('Invalid product ID')]),
  productController.deleteProduct
);

export default router;
