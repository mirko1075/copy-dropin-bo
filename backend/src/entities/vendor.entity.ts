import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';
import { Site } from './site.entity';

/**
 * Vendor Entity - Middle level of multi-tenancy hierarchy
 */
@Entity('vendors')
export class Vendor extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  code!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactEmail?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contactPhone?: string;

  @Column({ type: 'json', nullable: true })
  settings?: any;

  // Foreign Keys
  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  // Relations
  @ManyToOne(() => Tenant, (tenant) => tenant.vendors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @OneToMany(() => Site, (site) => site.vendor)
  sites!: Site[];
}
