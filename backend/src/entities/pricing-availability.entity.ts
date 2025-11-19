import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ServiceProduct } from './service-product.entity';
import { Site } from './site.entity';

/**
 * Pricing and Availability Entity
 * Manages dynamic pricing and availability schedules
 */
@Entity('pricing_availability')
export class PricingAvailability extends BaseEntity {
  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date' })
  endDate!: Date;

  @Column({ type: 'time', nullable: true })
  startTime?: string;

  @Column({ type: 'time', nullable: true })
  endTime?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'varchar', length: 10, default: 'EUR' })
  currency!: string;

  @Column({ type: 'int', nullable: true })
  maxCapacity?: number;

  @Column({ type: 'int', nullable: true })
  currentBookings?: number;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status!: string; // active, inactive, full

  @Column({ type: 'json', nullable: true })
  daysOfWeek?: string[]; // ['monday', 'tuesday', ...]

  @Column({ type: 'json', nullable: true })
  metadata?: any;

  // Foreign Keys
  @Column({ type: 'uuid', name: 'product_id' })
  productId!: string;

  @Column({ type: 'uuid', name: 'site_id' })
  siteId!: string;

  // Relations
  @ManyToOne(() => ServiceProduct, (product) => product.pricingAvailabilities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product!: ServiceProduct;

  @ManyToOne(() => Site, (site) => site.pricingAvailabilities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'site_id' })
  site!: Site;
}
