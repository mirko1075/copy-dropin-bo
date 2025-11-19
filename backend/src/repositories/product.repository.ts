import { AppDataSource } from '../config/database.config';
import { ServiceProduct } from '../entities/service-product.entity';
import { BaseRepository } from './base.repository';

/**
 * Product Repository
 * Specific data access methods for products
 */
export class ProductRepository extends BaseRepository<ServiceProduct> {
  constructor() {
    super(AppDataSource.getRepository(ServiceProduct));
  }

  /**
   * Find products by category
   */
  async findByCategory(categoryId: string): Promise<ServiceProduct[]> {
    return this.findAll({
      where: { categoryId } as any,
      relations: ['category', 'site'],
      order: { sortOrder: 'ASC', nameIt: 'ASC' },
    });
  }

  /**
   * Find products by site
   */
  async findBySite(siteId: string): Promise<ServiceProduct[]> {
    return this.findAll({
      where: { siteId } as any,
      relations: ['category', 'site'],
      order: { sortOrder: 'ASC', nameIt: 'ASC' },
    });
  }

  /**
   * Find products by status
   */
  async findByStatus(status: string, siteId?: string): Promise<ServiceProduct[]> {
    const where: any = { status };
    if (siteId) {
      where.siteId = siteId;
    }

    return this.findAll({
      where,
      relations: ['category', 'site'],
      order: { sortOrder: 'ASC', nameIt: 'ASC' },
    });
  }

  /**
   * Find product by code within a site
   */
  async findByCode(code: string, siteId: string): Promise<ServiceProduct | null> {
    return this.findOne({ code, siteId } as any, ['category', 'site']);
  }

  /**
   * Check if code exists within site
   */
  async codeExistsInSite(
    code: string,
    siteId: string,
    excludeId?: string
  ): Promise<boolean> {
    const query = this.repository
      .createQueryBuilder('product')
      .where('product.code = :code', { code })
      .andWhere('product.siteId = :siteId', { siteId });

    if (excludeId) {
      query.andWhere('product.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  /**
   * Search products by name (multi-language)
   */
  async searchByName(
    searchTerm: string,
    siteId?: string
  ): Promise<ServiceProduct[]> {
    const query = this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.site', 'site')
      .where(
        '(product.nameIt LIKE :search OR product.nameEn LIKE :search OR product.nameDe LIKE :search)',
        { search: `%${searchTerm}%` }
      );

    if (siteId) {
      query.andWhere('product.siteId = :siteId', { siteId });
    }

    return query.orderBy('product.sortOrder', 'ASC').getMany();
  }
}

// Export singleton instance
export const productRepository = new ProductRepository();
