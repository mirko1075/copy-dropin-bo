import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { NotFoundError } from '../utils/errors';

/**
 * Base Repository with common CRUD operations
 * Following DRY principle - all repositories extend this
 * Implements Repository Pattern for data access abstraction
 */
export class BaseRepository<T extends BaseEntity> {
  constructor(protected repository: Repository<T>) {}

  /**
   * Find all records with optional filters
   */
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  /**
   * Find one record by ID
   */
  async findById(id: string, relations?: string[]): Promise<T> {
    const record = await this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
      relations,
    });

    if (!record) {
      throw new NotFoundError(`Record with ID ${id} not found`);
    }

    return record;
  }

  /**
   * Find one record by conditions
   */
  async findOne(
    where: FindOptionsWhere<T>,
    relations?: string[]
  ): Promise<T | null> {
    return this.repository.findOne({
      where,
      relations,
    });
  }

  /**
   * Find with pagination
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    options?: FindManyOptions<T>
  ): Promise<{ data: T[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      ...options,
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<T> {
    const record = this.repository.create(data);
    return this.repository.save(record);
  }

  /**
   * Update a record
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const record = await this.findById(id);
    Object.assign(record, data);
    return this.repository.save(record);
  }

  /**
   * Delete a record (soft delete)
   */
  async delete(id: string): Promise<void> {
    const record = await this.findById(id);
    await this.repository.softRemove(record);
  }

  /**
   * Hard delete a record
   */
  async hardDelete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * Count records
   */
  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count({ where });
  }

  /**
   * Check if record exists
   */
  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.count({ where });
    return count > 0;
  }
}
