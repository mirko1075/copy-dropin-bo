-- ============================================
-- Database Creation Script
-- Backoffice MySQL Database
-- ============================================

-- Drop database if exists (ATTENZIONE: cancella tutti i dati!)
-- DROP DATABASE IF EXISTS backoffice_db;

-- Create database with UTF8MB4 encoding
CREATE DATABASE IF NOT EXISTS backoffice_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Select the database
USE backoffice_db;

-- Show database info
SELECT
  'Database created successfully' AS message,
  DATABASE() AS current_database,
  @@character_set_database AS charset,
  @@collation_database AS collation;
