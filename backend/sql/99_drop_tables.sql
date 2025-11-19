-- ============================================
-- Drop All Tables Script
-- WARNING: This will delete ALL data!
-- Use only for complete reset
-- ============================================

USE backoffice_db;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all tables
DROP TABLE IF EXISTS pricing_availability;
DROP TABLE IF EXISTS service_products;
DROP TABLE IF EXISTS service_categories;
DROP TABLE IF EXISTS payment_configs;
DROP TABLE IF EXISTS sites;
DROP TABLE IF EXISTS vendors;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS tenants;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify all tables are dropped
SHOW TABLES;

SELECT 'All tables dropped successfully' AS message;
