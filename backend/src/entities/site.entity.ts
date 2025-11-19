import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Vendor } from './vendor.entity';
import { ServiceProduct } from './service-product.entity';
import { PricingAvailability } from './pricing-availability.entity';

/**
 * Site Entity - Bottom level of multi-tenancy hierarchy
 * Represents physical locations (hotels, spas, restaurants)
 */
@Entity('sites')
export class Site extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  code!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type?: string; // hotel, spa, restaurant, etc.

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactEmail?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contactPhone?: string;

  @Column({ type: 'json', nullable: true })
  settings?: any;

  // Foreign Keys
  @Column({ type: 'uuid', name: 'vendor_id' })
  vendorId!: string;

  // Relations
  @ManyToOne(() => Vendor, (vendor) => vendor.sites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendor_id' })
  vendor!: Vendor;

  @OneToMany(() => ServiceProduct, (product) => product.site)
  products!: ServiceProduct[];

  @OneToMany(() => PricingAvailability, (pricing) => pricing.site)
  pricingAvailabilities!: PricingAvailability[];
}
