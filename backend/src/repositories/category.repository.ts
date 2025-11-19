import { AppDataSource } from '../config/database.config';
import { ServiceCategory } from '../entities/service-category.entity';
import { BaseRepository } from './base.repository';

/**
 * Category Repository
 * Specific data access methods for categories
 */
export class CategoryRepository extends BaseRepository<ServiceCategory> {
  constructor() {
    super(AppDataSource.getRepository(ServiceCategory));
  }

  /**
   * Find category by code
   */
  async findByCode(code: string): Promise<ServiceCategory | null> {
    return this.findOne({ code } as any);
  }

  /**
   * Find active categories
   */
  async findActive(): Promise<ServiceCategory[]> {
    return this.findAll({
      where: { status: 'active' } as any,
      order: { sortOrder: 'ASC', nameIt: 'ASC' },
    });
  }

  /**
   * Check if code already exists
   */
  async codeExists(code: string, excludeId?: string): Promise<boolean> {
    const query = this.repository.createQueryBuilder('category')
      .where('category.code = :code', { code });

    if (excludeId) {
      query.andWhere('category.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }
}

// Export singleton instance
export const categoryRepository = new CategoryRepository();
