import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Vendor } from './vendor.entity';
import { User } from './user.entity';

/**
 * Tenant Entity - Top level of multi-tenancy hierarchy
 * Tenant → Vendor → Site
 */
@Entity('tenants')
export class Tenant extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status!: string;

  @Column({ type: 'json', nullable: true })
  settings?: any;

  // Relations
  @OneToMany(() => Vendor, (vendor) => vendor.tenant)
  vendors!: Vendor[];

  @OneToMany(() => User, (user) => user.tenant)
  users!: User[];
}
