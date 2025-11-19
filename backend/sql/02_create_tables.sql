-- ============================================
-- Tables Creation Script
-- Backoffice MySQL Database Schema
-- ============================================

USE backoffice_db;

-- ============================================
-- 1. TENANTS TABLE
-- Top level of multi-tenancy hierarchy
-- ============================================

CREATE TABLE IF NOT EXISTS tenants (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  settings JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,

  INDEX idx_tenants_code (code),
  INDEX idx_tenants_status (status),
  INDEX idx_tenants_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. VENDORS TABLE
-- Middle level of multi-tenancy hierarchy
-- ============================================

CREATE TABLE IF NOT EXISTS vendors (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id CHAR(36) NOT NULL,
  code VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  settings JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,

  CONSTRAINT fk_vendors_tenant FOREIGN KEY (tenant_id)
    REFERENCES tenants(id) ON DELETE CASCADE,

  INDEX idx_vendors_tenant (tenant_id),
  INDEX idx_vendors_code (code),
  INDEX idx_vendors_status (status),
  INDEX idx_vendors_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. SITES TABLE
-- Bottom level of multi-tenancy hierarchy
-- Physical locations (hotels, spas, restaurants)
-- ============================================

CREATE TABLE IF NOT EXISTS sites (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  vendor_id CHAR(36) NOT NULL,
  code VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  type VARCHAR(50) COMMENT 'hotel, spa, restaurant, etc.',
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  settings JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,

  CONSTRAINT fk_sites_vendor FOREIGN KEY (vendor_id)
    REFERENCES vendors(id) ON DELETE CASCADE,

  INDEX idx_sites_vendor (vendor_id),
  INDEX idx_sites_code (code),
  INDEX idx_sites_type (type),
  INDEX idx_sites_status (status),
  INDEX idx_sites_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. SERVICE CATEGORIES TABLE
-- Multi-language support (IT, EN, DE, FR, ES)
-- ============================================

CREATE TABLE IF NOT EXISTS service_categories (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'active',

  -- Multi-language names
  name_it VARCHAR(255) NOT NULL COMMENT 'Italian name',
  name_en VARCHAR(255) NOT NULL COMMENT 'English name',
  name_de VARCHAR(255) NOT NULL COMMENT 'German name',
  name_fr VARCHAR(255) COMMENT 'French name',
  name_es VARCHAR(255) COMMENT 'Spanish name',

  -- Multi-language descriptions
  description_it TEXT COMMENT 'Italian description',
  description_en TEXT COMMENT 'English description',
  description_de TEXT COMMENT 'German description',
  description_fr TEXT COMMENT 'French description',
  description_es TEXT COMMENT 'Spanish description',

  icon VARCHAR(255),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,

  INDEX idx_categories_code (code),
  INDEX idx_categories_status (status),
  INDEX idx_categories_sort (sort_order),
  INDEX idx_categories_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. SERVICE PRODUCTS TABLE
-- Services offered (spa treatments, restaurant items, hotel services)
-- Multi-language support (IT, EN, DE)
-- ============================================

CREATE TABLE IF NOT EXISTS service_products (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  category_id CHAR(36) NOT NULL,
  site_id CHAR(36) NOT NULL,
  code VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',

  -- Multi-language names
  name_it VARCHAR(255) NOT NULL COMMENT 'Italian name',
  name_en VARCHAR(255) NOT NULL COMMENT 'English name',
  name_de VARCHAR(255) NOT NULL COMMENT 'German name',

  -- Multi-language descriptions
  description_it TEXT COMMENT 'Italian description',
  description_en TEXT COMMENT 'English description',
  description_de TEXT COMMENT 'German description',

  -- Product details
  base_price DECIMAL(10, 2) COMMENT 'Base price',
  currency VARCHAR(10) DEFAULT 'EUR',
  duration INT COMMENT 'Duration in minutes',
  image_url VARCHAR(255),
  sort_order INT NOT NULL DEFAULT 0,
  metadata JSON,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,

  CONSTRAINT fk_products_category FOREIGN KEY (category_id)
    REFERENCES service_categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_products_site FOREIGN KEY (site_id)
    REFERENCES sites(id) ON DELETE CASCADE,

  INDEX idx_products_category (category_id),
  INDEX idx_products_site (site_id),
  INDEX idx_products_code (code),
  INDEX idx_products_status (status),
  INDEX idx_products_sort (sort_order),
  INDEX idx_products_deleted (deleted_at),

  -- Unique constraint: code must be unique within a site
  UNIQUE KEY uk_products_code_site (code, site_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. PRICING AVAILABILITY TABLE
-- Dynamic pricing and availability schedules
-- ============================================

CREATE TABLE IF NOT EXISTS pricing_availability (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  product_id CHAR(36) NOT NULL,
  site_id CHAR(36) NOT NULL,

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,

  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'EUR',

  max_capacity INT COMMENT 'Maximum number of bookings',
  current_bookings INT DEFAULT 0 COMMENT 'Current number of bookings',
  status VARCHAR(50) NOT NULL DEFAULT 'active',

  days_of_week JSON COMMENT 'Array of days: ["monday", "tuesday", ...]',
  metadata JSON,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,

  CONSTRAINT fk_pricing_product FOREIGN KEY (product_id)
    REFERENCES service_products(id) ON DELETE CASCADE,
  CONSTRAINT fk_pricing_site FOREIGN KEY (site_id)
    REFERENCES sites(id) ON DELETE CASCADE,

  INDEX idx_pricing_product (product_id),
  INDEX idx_pricing_site (site_id),
  INDEX idx_pricing_dates (start_date, end_date),
  INDEX idx_pricing_status (status),
  INDEX idx_pricing_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. PAYMENT CONFIGS TABLE
-- Payment gateway configurations per site/vendor
-- ============================================

CREATE TABLE IF NOT EXISTS payment_configs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  site_id CHAR(36),
  vendor_id CHAR(36),

  provider VARCHAR(50) NOT NULL COMMENT 'stripe, paypal, braintree, etc.',
  public_key VARCHAR(255),
  secret_key VARCHAR(255) COMMENT 'Should be encrypted in production',
  webhook_secret VARCHAR(255),

  mode VARCHAR(50) NOT NULL DEFAULT 'test' COMMENT 'test or live',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  settings JSON,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,

  INDEX idx_payment_site (site_id),
  INDEX idx_payment_vendor (vendor_id),
  INDEX idx_payment_provider (provider),
  INDEX idx_payment_status (status),
  INDEX idx_payment_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. USERS TABLE
-- For future authentication implementation
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  tenant_id CHAR(36) NOT NULL,

  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) COMMENT 'BCrypt hash - not used yet',

  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'viewer' COMMENT 'admin, manager, editor, viewer',
  status VARCHAR(50) NOT NULL DEFAULT 'active' COMMENT 'active, inactive, suspended',

  last_login TIMESTAMP NULL,
  permissions JSON COMMENT 'Array of permission strings',

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,

  CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id)
    REFERENCES tenants(id) ON DELETE CASCADE,

  INDEX idx_users_tenant (tenant_id),
  INDEX idx_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_status (status),
  INDEX idx_users_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Show created tables
-- ============================================

SHOW TABLES;

SELECT
  'All tables created successfully' AS message,
  COUNT(*) AS total_tables
FROM information_schema.tables
WHERE table_schema = 'backoffice_db';
