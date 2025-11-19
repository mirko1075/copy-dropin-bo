import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { ResponseHandler } from '../utils/response';
import { asyncHandler } from '../middlewares/error.middleware';

/**
 * Product Controller
 * Handles HTTP requests for products
 * Following Single Responsibility Principle
 */
export class ProductController {
  /**
   * GET /products
   * Get all products with optional filters
   */
  getAllProducts = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const siteId = req.query.siteId as string || req.siteId;
      const categoryId = req.query.categoryId as string;
      const status = req.query.status as string;
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const result = await productService.getAllProducts(
        siteId,
        categoryId,
        status,
        page,
        limit
      );

      if (result.total !== undefined) {
        // Paginated response
        res.setHeader('X-Total-Count', result.total);
        res.setHeader('X-Page', result.page);
        res.setHeader('X-Total-Pages', result.totalPages);
      }

      ResponseHandler.success(res, result.data, 'Products retrieved successfully');
    }
  );

  /**
   * GET /products/:id
   * Get product by ID
   */
  getProductById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      ResponseHandler.success(res, product, 'Product retrieved successfully');
    }
  );

  /**
   * GET /products/category/:categoryId
   * Get products by category
   */
  getProductsByCategory = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { categoryId } = req.params;
      const products = await productService.getProductsByCategory(categoryId);
      ResponseHandler.success(res, products, 'Products retrieved successfully');
    }
  );

  /**
   * GET /products/site/:siteId
   * Get products by site
   */
  getProductsBySite = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { siteId } = req.params;
      const products = await productService.getProductsBySite(siteId);
      ResponseHandler.success(res, products, 'Products retrieved successfully');
    }
  );

  /**
   * GET /products/search
   * Search products by name
   */
  searchProducts = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const searchTerm = req.query.q as string;
      const siteId = req.query.siteId as string || req.siteId;

      if (!searchTerm) {
        return ResponseHandler.error(res, 'Search term is required', 400);
      }

      const products = await productService.searchProducts(searchTerm, siteId);
      ResponseHandler.success(res, products, 'Products search completed');
    }
  );

  /**
   * POST /products
   * Create new product
   */
  createProduct = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // Use siteId from context if not provided in body
      const productData = {
        ...req.body,
        siteId: req.body.siteId || req.siteId,
      };

      const product = await productService.createProduct(productData);
      ResponseHandler.created(res, product, 'Product created successfully');
    }
  );

  /**
   * PUT /products/:id
   * Update product
   */
  updateProduct = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const product = await productService.updateProduct(id, req.body);
      ResponseHandler.success(res, product, 'Product updated successfully');
    }
  );

  /**
   * PATCH /products/:id/status
   * Update product status
   */
  updateProductStatus = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { status } = req.body;
      const product = await productService.updateProductStatus(id, status);
      ResponseHandler.success(res, product, 'Product status updated successfully');
    }
  );

  /**
   * DELETE /products/:id
   * Delete product
   */
  deleteProduct = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      await productService.deleteProduct(id);
      ResponseHandler.noContent(res);
    }
  );
}

// Export singleton instance
export const productController = new ProductController();
