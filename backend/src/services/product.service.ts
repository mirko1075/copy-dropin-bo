import { productRepository } from '../repositories/product.repository';
import { ServiceProduct } from '../entities/service-product.entity';
import { ConflictError, NotFoundError, BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Product Service
 * Business logic for products
 * Following Single Responsibility Principle
 */
export class ProductService {
  /**
   * Get all products with optional filters
   */
  async getAllProducts(
    siteId?: string,
    categoryId?: string,
    status?: string,
    page?: number,
    limit?: number
  ): Promise<any> {
    try {
      const where: any = {};

      if (siteId) where.siteId = siteId;
      if (categoryId) where.categoryId = categoryId;
      if (status) where.status = status;

      if (page && limit) {
        return await productRepository.findWithPagination(page, limit, {
          where,
          relations: ['category', 'site'],
          order: { sortOrder: 'ASC', nameIt: 'ASC' },
        });
      }

      const products = await productRepository.findAll({
        where,
        relations: ['category', 'site'],
        order: { sortOrder: 'ASC', nameIt: 'ASC' },
      });

      return { data: products };
    } catch (error) {
      logger.error('Error fetching products', { error });
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<ServiceProduct> {
    try {
      return await productRepository.findById(id, ['category', 'site']);
    } catch (error) {
      logger.error(`Error fetching product ${id}`, { error });
      throw error;
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: string): Promise<ServiceProduct[]> {
    try {
      return await productRepository.findByCategory(categoryId);
    } catch (error) {
      logger.error(`Error fetching products by category ${categoryId}`, { error });
      throw error;
    }
  }

  /**
   * Get products by site
   */
  async getProductsBySite(siteId: string): Promise<ServiceProduct[]> {
    try {
      return await productRepository.findBySite(siteId);
    } catch (error) {
      logger.error(`Error fetching products by site ${siteId}`, { error });
      throw error;
    }
  }

  /**
   * Search products by name
   */
  async searchProducts(searchTerm: string, siteId?: string): Promise<ServiceProduct[]> {
    try {
      return await productRepository.searchByName(searchTerm, siteId);
    } catch (error) {
      logger.error('Error searching products', { error, searchTerm });
      throw error;
    }
  }

  /**
   * Create new product
   */
  async createProduct(data: Partial<ServiceProduct>): Promise<ServiceProduct> {
    try {
      // Validate required fields
      if (!data.code || !data.categoryId || !data.siteId) {
        throw new BadRequestError('Code, categoryId, and siteId are required');
      }

      if (!data.nameIt || !data.nameEn || !data.nameDe) {
        throw new BadRequestError('Names (IT, EN, DE) are required');
      }

      // Check if code exists in the same site
      const codeExists = await productRepository.codeExistsInSite(
        data.code,
        data.siteId
      );
      if (codeExists) {
        throw new ConflictError(
          `Product with code ${data.code} already exists in this site`
        );
      }

      const product = await productRepository.create({
        ...data,
        status: data.status || 'draft',
        sortOrder: data.sortOrder || 0,
        currency: data.currency || 'EUR',
      });

      logger.info(`Product created: ${product.id}`, { product });
      return await this.getProductById(product.id);
    } catch (error) {
      logger.error('Error creating product', { error, data });
      throw error;
    }
  }

  /**
   * Update product
   */
  async updateProduct(
    id: string,
    data: Partial<ServiceProduct>
  ): Promise<ServiceProduct> {
    try {
      // Check if product exists
      const existingProduct = await productRepository.findById(id);

      // If code is being changed, check if new code exists
      if (data.code && data.code !== existingProduct.code) {
        const codeExists = await productRepository.codeExistsInSite(
          data.code,
          existingProduct.siteId,
          id
        );
        if (codeExists) {
          throw new ConflictError(
            `Product with code ${data.code} already exists in this site`
          );
        }
      }

      await productRepository.update(id, data);

      logger.info(`Product updated: ${id}`);
      return await this.getProductById(id);
    } catch (error) {
      logger.error(`Error updating product ${id}`, { error, data });
      throw error;
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      await productRepository.findById(id);
      await productRepository.delete(id);

      logger.info(`Product deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting product ${id}`, { error });
      throw error;
    }
  }

  /**
   * Update product status
   */
  async updateProductStatus(id: string, status: string): Promise<ServiceProduct> {
    try {
      const validStatuses = ['draft', 'published', 'archived'];
      if (!validStatuses.includes(status)) {
        throw new BadRequestError(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        );
      }

      return await this.updateProduct(id, { status });
    } catch (error) {
      logger.error(`Error updating product status ${id}`, { error });
      throw error;
    }
  }
}

// Export singleton instance
export const productService = new ProductService();
