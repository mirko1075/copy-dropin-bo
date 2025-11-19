import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';
import { ResponseHandler } from '../utils/response';
import { asyncHandler } from '../middlewares/error.middleware';

/**
 * Category Controller
 * Handles HTTP requests for categories
 * Following Single Responsibility Principle
 */
export class CategoryController {
  /**
   * GET /categories
   * Get all categories
   */
  getAllCategories = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const result = await categoryService.getAllCategories(page, limit);

      if (result.total !== undefined) {
        // Paginated response
        res.setHeader('X-Total-Count', result.total);
        res.setHeader('X-Page', result.page);
        res.setHeader('X-Total-Pages', result.totalPages);
      }

      ResponseHandler.success(res, result.data, 'Categories retrieved successfully');
    }
  );

  /**
   * GET /categories/active
   * Get active categories only
   */
  getActiveCategories = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const categories = await categoryService.getActiveCategories();
      ResponseHandler.success(res, categories, 'Active categories retrieved successfully');
    }
  );

  /**
   * GET /categories/:id
   * Get category by ID
   */
  getCategoryById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const category = await categoryService.getCategoryById(id);
      ResponseHandler.success(res, category, 'Category retrieved successfully');
    }
  );

  /**
   * GET /categories/code/:code
   * Get category by code
   */
  getCategoryByCode = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { code } = req.params;
      const category = await categoryService.getCategoryByCode(code);
      ResponseHandler.success(res, category, 'Category retrieved successfully');
    }
  );

  /**
   * POST /categories
   * Create new category
   */
  createCategory = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const category = await categoryService.createCategory(req.body);
      ResponseHandler.created(res, category, 'Category created successfully');
    }
  );

  /**
   * PUT /categories/:id
   * Update category
   */
  updateCategory = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const category = await categoryService.updateCategory(id, req.body);
      ResponseHandler.success(res, category, 'Category updated successfully');
    }
  );

  /**
   * PATCH /categories/:id/status
   * Update category status
   */
  updateCategoryStatus = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { status } = req.body;
      const category = await categoryService.updateCategoryStatus(id, status);
      ResponseHandler.success(res, category, 'Category status updated successfully');
    }
  );

  /**
   * DELETE /categories/:id
   * Delete category
   */
  deleteCategory = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      await categoryService.deleteCategory(id);
      ResponseHandler.noContent(res);
    }
  );
}

// Export singleton instance
export const categoryController = new CategoryController();
