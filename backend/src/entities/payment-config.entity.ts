import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

/**
 * Payment Configuration Entity
 * Stores payment gateway configurations per site/vendor
 */
@Entity('payment_configs')
export class PaymentConfig extends BaseEntity {
  @Column({ type: 'uuid', name: 'site_id', nullable: true })
  siteId?: string;

  @Column({ type: 'uuid', name: 'vendor_id', nullable: true })
  vendorId?: string;

  @Column({ type: 'varchar', length: 50 })
  provider!: string; // stripe, paypal, braintree, etc.

  @Column({ type: 'varchar', length: 255, nullable: true })
  publicKey?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  secretKey?: string; // Should be encrypted in production

  @Column({ type: 'varchar', length: 255, nullable: true })
  webhookSecret?: string;

  @Column({ type: 'varchar', length: 50, default: 'test' })
  mode!: string; // test, live

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status!: string;

  @Column({ type: 'json', nullable: true })
  settings?: any;
}
