import { categoryRepository } from '../repositories/category.repository';
import { ServiceCategory } from '../entities/service-category.entity';
import { ConflictError, NotFoundError, BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Category Service
 * Business logic for categories
 * Following Single Responsibility Principle
 */
export class CategoryService {
  /**
   * Get all categories
   */
  async getAllCategories(page?: number, limit?: number): Promise<any> {
    try {
      if (page && limit) {
        return await categoryRepository.findWithPagination(page, limit, {
          order: { sortOrder: 'ASC', nameIt: 'ASC' },
        });
      }

      const categories = await categoryRepository.findAll({
        order: { sortOrder: 'ASC', nameIt: 'ASC' },
      });

      return { data: categories };
    } catch (error) {
      logger.error('Error fetching categories', { error });
      throw error;
    }
  }

  /**
   * Get active categories only
   */
  async getActiveCategories(): Promise<ServiceCategory[]> {
    try {
      return await categoryRepository.findActive();
    } catch (error) {
      logger.error('Error fetching active categories', { error });
      throw error;
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<ServiceCategory> {
    try {
      return await categoryRepository.findById(id);
    } catch (error) {
      logger.error(`Error fetching category ${id}`, { error });
      throw error;
    }
  }

  /**
   * Get category by code
   */
  async getCategoryByCode(code: string): Promise<ServiceCategory> {
    try {
      const category = await categoryRepository.findByCode(code);
      if (!category) {
        throw new NotFoundError(`Category with code ${code} not found`);
      }
      return category;
    } catch (error) {
      logger.error(`Error fetching category by code ${code}`, { error });
      throw error;
    }
  }

  /**
   * Create new category
   */
  async createCategory(data: Partial<ServiceCategory>): Promise<ServiceCategory> {
    try {
      // Validate required fields
      if (!data.code || !data.nameIt || !data.nameEn || !data.nameDe) {
        throw new BadRequestError(
          'Code and names (IT, EN, DE) are required'
        );
      }

      // Check if code already exists
      const codeExists = await categoryRepository.codeExists(data.code);
      if (codeExists) {
        throw new ConflictError(`Category with code ${data.code} already exists`);
      }

      const category = await categoryRepository.create({
        ...data,
        status: data.status || 'active',
        sortOrder: data.sortOrder || 0,
      });

      logger.info(`Category created: ${category.id}`, { category });
      return category;
    } catch (error) {
      logger.error('Error creating category', { error, data });
      throw error;
    }
  }

  /**
   * Update category
   */
  async updateCategory(
    id: string,
    data: Partial<ServiceCategory>
  ): Promise<ServiceCategory> {
    try {
      // Check if category exists
      await categoryRepository.findById(id);

      // If code is being changed, check if new code exists
      if (data.code) {
        const codeExists = await categoryRepository.codeExists(data.code, id);
        if (codeExists) {
          throw new ConflictError(`Category with code ${data.code} already exists`);
        }
      }

      const category = await categoryRepository.update(id, data);

      logger.info(`Category updated: ${id}`, { category });
      return category;
    } catch (error) {
      logger.error(`Error updating category ${id}`, { error, data });
      throw error;
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      await categoryRepository.findById(id);
      await categoryRepository.delete(id);

      logger.info(`Category deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting category ${id}`, { error });
      throw error;
    }
  }

  /**
   * Update category status
   */
  async updateCategoryStatus(id: string, status: string): Promise<ServiceCategory> {
    try {
      const validStatuses = ['active', 'inactive', 'archived'];
      if (!validStatuses.includes(status)) {
        throw new BadRequestError(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        );
      }

      return await this.updateCategory(id, { status });
    } catch (error) {
      logger.error(`Error updating category status ${id}`, { error });
      throw error;
    }
  }
}

// Export singleton instance
export const categoryService = new CategoryService();
