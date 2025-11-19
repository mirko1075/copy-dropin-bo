import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';

/**
 * User Entity
 * For future authentication implementation
 * Currently JWT is always valid, but structure is prepared
 */
@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash?: string; // Not used yet, prepared for future

  @Column({ type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', length: 50, default: 'viewer' })
  role!: string; // admin, manager, editor, viewer

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status!: string; // active, inactive, suspended

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @Column({ type: 'json', nullable: true })
  permissions?: string[];

  // Foreign Keys
  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  // Relations
  @ManyToOne(() => Tenant, (tenant) => tenant.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;
}
