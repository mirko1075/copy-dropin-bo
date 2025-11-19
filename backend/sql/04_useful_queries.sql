-- ============================================
-- Useful Queries for Development & Testing
-- ============================================

USE backoffice_db;

-- ============================================
-- 1. VIEW ALL PRODUCTS WITH CATEGORY AND SITE
-- ============================================

SELECT
  p.id,
  p.code,
  p.name_it,
  p.name_en,
  p.base_price,
  p.currency,
  p.duration,
  p.status,
  c.name_it AS category_name,
  s.name AS site_name,
  s.city
FROM service_products p
LEFT JOIN service_categories c ON p.category_id = c.id
LEFT JOIN sites s ON p.site_id = s.id
WHERE p.deleted_at IS NULL
ORDER BY p.sort_order, p.name_it;

-- ============================================
-- 2. VIEW PRICING WITH PRODUCT INFO
-- ============================================

SELECT
  pr.id,
  p.name_it AS product_name,
  pr.start_date,
  pr.end_date,
  pr.price,
  pr.currency,
  pr.max_capacity,
  pr.current_bookings,
  (pr.max_capacity - pr.current_bookings) AS available_slots,
  pr.days_of_week
FROM pricing_availability pr
LEFT JOIN service_products p ON pr.product_id = p.id
WHERE pr.deleted_at IS NULL
  AND pr.status = 'active'
ORDER BY pr.start_date;

-- ============================================
-- 3. VIEW MULTI-TENANCY HIERARCHY
-- ============================================

SELECT
  t.name AS tenant_name,
  v.name AS vendor_name,
  s.name AS site_name,
  s.type AS site_type,
  s.city,
  s.status
FROM tenants t
LEFT JOIN vendors v ON v.tenant_id = t.id
LEFT JOIN sites s ON s.vendor_id = v.id
WHERE t.deleted_at IS NULL
  AND v.deleted_at IS NULL
  AND s.deleted_at IS NULL
ORDER BY t.name, v.name, s.name;

-- ============================================
-- 4. COUNT PRODUCTS BY CATEGORY
-- ============================================

SELECT
  c.name_it AS category,
  COUNT(p.id) AS total_products,
  SUM(CASE WHEN p.status = 'published' THEN 1 ELSE 0 END) AS published,
  SUM(CASE WHEN p.status = 'draft' THEN 1 ELSE 0 END) AS draft
FROM service_categories c
LEFT JOIN service_products p ON p.category_id = c.id AND p.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.name_it
ORDER BY total_products DESC;

-- ============================================
-- 5. COUNT PRODUCTS BY SITE
-- ============================================

SELECT
  s.name AS site,
  s.type,
  COUNT(p.id) AS total_products
FROM sites s
LEFT JOIN service_products p ON p.site_id = s.id AND p.deleted_at IS NULL
WHERE s.deleted_at IS NULL
GROUP BY s.id, s.name, s.type
ORDER BY total_products DESC;

-- ============================================
-- 6. SEARCH PRODUCTS BY NAME (Multi-language)
-- ============================================

SELECT
  p.id,
  p.code,
  p.name_it,
  p.name_en,
  p.name_de,
  c.name_it AS category
FROM service_products p
LEFT JOIN service_categories c ON p.category_id = c.id
WHERE p.deleted_at IS NULL
  AND (
    p.name_it LIKE '%massage%'
    OR p.name_en LIKE '%massage%'
    OR p.name_de LIKE '%massage%'
  )
ORDER BY p.name_it;

-- ============================================
-- 7. VIEW USERS WITH TENANT INFO
-- ============================================

SELECT
  u.id,
  u.email,
  CONCAT(u.first_name, ' ', u.last_name) AS full_name,
  u.role,
  u.status,
  t.name AS tenant_name,
  u.last_login
FROM users u
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE u.deleted_at IS NULL
ORDER BY u.role, u.email;

-- ============================================
-- 8. FIND AVAILABLE SLOTS FOR A DATE
-- ============================================

SELECT
  p.name_it AS product,
  pr.start_date,
  pr.end_date,
  pr.price,
  pr.max_capacity,
  pr.current_bookings,
  (pr.max_capacity - pr.current_bookings) AS available_slots
FROM pricing_availability pr
LEFT JOIN service_products p ON pr.product_id = p.id
WHERE pr.deleted_at IS NULL
  AND pr.status = 'active'
  AND '2025-01-15' BETWEEN pr.start_date AND pr.end_date
  AND (pr.max_capacity - pr.current_bookings) > 0
ORDER BY pr.price;

-- ============================================
-- 9. CLEANUP SOFT DELETED RECORDS (use with caution!)
-- ============================================

-- View soft deleted records
SELECT 'tenants' AS table_name, COUNT(*) AS deleted_count FROM tenants WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 'vendors', COUNT(*) FROM vendors WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 'sites', COUNT(*) FROM sites WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 'service_categories', COUNT(*) FROM service_categories WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 'service_products', COUNT(*) FROM service_products WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 'pricing_availability', COUNT(*) FROM pricing_availability WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 'users', COUNT(*) FROM users WHERE deleted_at IS NOT NULL;

-- To permanently delete soft deleted records (UNCOMMENT TO USE):
-- DELETE FROM tenants WHERE deleted_at IS NOT NULL;
-- DELETE FROM vendors WHERE deleted_at IS NOT NULL;
-- DELETE FROM sites WHERE deleted_at IS NOT NULL;
-- DELETE FROM service_categories WHERE deleted_at IS NOT NULL;
-- DELETE FROM service_products WHERE deleted_at IS NOT NULL;
-- DELETE FROM pricing_availability WHERE deleted_at IS NOT NULL;
-- DELETE FROM users WHERE deleted_at IS NOT NULL;

-- ============================================
-- 10. DATABASE STATISTICS
-- ============================================

SELECT
  table_name,
  table_rows,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'backoffice_db'
ORDER BY (data_length + index_length) DESC;
