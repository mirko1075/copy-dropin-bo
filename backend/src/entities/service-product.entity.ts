import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ServiceCategory } from './service-category.entity';
import { Site } from './site.entity';
import { PricingAvailability } from './pricing-availability.entity';

/**
 * Service Product Entity
 * Represents services offered (spa treatments, restaurant items, hotel services)
 * Supports multi-language (IT, EN, DE)
 */
@Entity('service_products')
export class ServiceProduct extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  code!: string;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status!: string; // draft, published, archived

  // Multi-language fields
  @Column({ type: 'varchar', length: 255 })
  nameIt!: string;

  @Column({ type: 'varchar', length: 255 })
  nameEn!: string;

  @Column({ type: 'varchar', length: 255 })
  nameDe!: string;

  @Column({ type: 'text', nullable: true })
  descriptionIt?: string;

  @Column({ type: 'text', nullable: true })
  descriptionEn?: string;

  @Column({ type: 'text', nullable: true })
  descriptionDe?: string;

  // Product details
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  basePrice?: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency?: string;

  @Column({ type: 'int', nullable: true })
  duration?: number; // in minutes

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl?: string;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'json', nullable: true })
  metadata?: any;

  // Foreign Keys
  @Column({ type: 'uuid', name: 'category_id' })
  categoryId!: string;

  @Column({ type: 'uuid', name: 'site_id' })
  siteId!: string;

  // Relations
  @ManyToOne(() => ServiceCategory, (category) => category.products, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category!: ServiceCategory;

  @ManyToOne(() => Site, (site) => site.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'site_id' })
  site!: Site;

  @OneToMany(() => PricingAvailability, (pricing) => pricing.product)
  pricingAvailabilities!: PricingAvailability[];
}
