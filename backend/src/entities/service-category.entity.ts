import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ServiceProduct } from './service-product.entity';

/**
 * Service Category Entity
 * Supports multi-language (IT, EN, DE, FR, ES)
 */
@Entity('service_categories')
export class ServiceCategory extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status!: string; // active, inactive, archived

  // Multi-language fields
  @Column({ type: 'varchar', length: 255 })
  nameIt!: string;

  @Column({ type: 'varchar', length: 255 })
  nameEn!: string;

  @Column({ type: 'varchar', length: 255 })
  nameDe!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nameFr?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nameEs?: string;

  @Column({ type: 'text', nullable: true })
  descriptionIt?: string;

  @Column({ type: 'text', nullable: true })
  descriptionEn?: string;

  @Column({ type: 'text', nullable: true })
  descriptionDe?: string;

  @Column({ type: 'text', nullable: true })
  descriptionFr?: string;

  @Column({ type: 'text', nullable: true })
  descriptionEs?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon?: string;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  // Relations
  @OneToMany(() => ServiceProduct, (product) => product.category)
  products!: ServiceProduct[];
}
