export interface Tenant {
  id: number;
  name: string;
  domain?: string;
  logoUrl?: string;
  active: boolean;
}

export interface Vendor {
  id: number;
  tenantId: number;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  active: boolean;
}

export interface Site {
  id: number;
  vendorId: number;
  name: string;
  locale: string;         // Es: 'it_IT', 'en_US'
  active: boolean;
}

export interface TenantContext {
  tenantId: number;
  vendorId: number;
  siteId: number;
  locale: string;
}
