-- ============================================
-- Seed Data Script
-- Sample data for testing and development
-- ============================================

USE backoffice_db;

-- ============================================
-- 1. INSERT SAMPLE TENANT
-- ============================================

INSERT INTO tenants (id, code, name, description, status, settings)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'demo-org',
    'Demo Organization',
    'Demo tenant for testing purposes',
    'active',
    JSON_OBJECT('timezone', 'Europe/Rome', 'currency', 'EUR')
  );

-- ============================================
-- 2. INSERT SAMPLE VENDOR
-- ============================================

INSERT INTO vendors (id, tenant_id, code, name, description, status, contact_email, contact_phone)
VALUES
  (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'demo-hotel-group',
    'Demo Hotel Group',
    'Chain of luxury hotels and spas',
    'active',
    'info@demohotels.com',
    '+39 02 1234567'
  );

-- ============================================
-- 3. INSERT SAMPLE SITES
-- ============================================

INSERT INTO sites (id, vendor_id, code, name, description, type, status, city, country, contact_email)
VALUES
  (
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'milan-spa',
    'Milano Wellness Spa',
    'Luxury wellness center in the heart of Milan',
    'spa',
    'active',
    'Milano',
    'Italy',
    'milan@demohotels.com'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    'rome-hotel',
    'Roma Grand Hotel',
    'Five-star hotel with spa facilities',
    'hotel',
    'active',
    'Roma',
    'Italy',
    'rome@demohotels.com'
  );

-- ============================================
-- 4. INSERT SERVICE CATEGORIES
-- ============================================

INSERT INTO service_categories (id, code, name_it, name_en, name_de, name_fr, name_es, status, sort_order)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'spa-treatments',
    'Trattamenti Spa',
    'Spa Treatments',
    'Spa-Behandlungen',
    'Soins Spa',
    'Tratamientos de Spa',
    'active',
    1
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'massages',
    'Massaggi',
    'Massages',
    'Massagen',
    'Massages',
    'Masajes',
    'active',
    2
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'beauty-treatments',
    'Trattamenti Estetici',
    'Beauty Treatments',
    'Schönheitsbehandlungen',
    'Soins de Beauté',
    'Tratamientos de Belleza',
    'active',
    3
  );

-- ============================================
-- 5. INSERT SERVICE PRODUCTS
-- ============================================

INSERT INTO service_products (
  id, category_id, site_id, code,
  name_it, name_en, name_de,
  description_it, description_en, description_de,
  base_price, currency, duration, status, sort_order
)
VALUES
  -- Massages
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '33333333-3333-3333-3333-333333333333',
    'hot-stone-massage',
    'Massaggio Pietre Calde',
    'Hot Stone Massage',
    'Hot-Stone-Massage',
    'Rilassante massaggio con pietre vulcaniche riscaldate',
    'Relaxing massage with heated volcanic stones',
    'Entspannende Massage mit erhitzten Vulkansteinen',
    85.00,
    'EUR',
    60,
    'published',
    1
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '33333333-3333-3333-3333-333333333333',
    'aromatherapy-massage',
    'Massaggio Aromaterapico',
    'Aromatherapy Massage',
    'Aromatherapie-Massage',
    'Massaggio rilassante con oli essenziali selezionati',
    'Relaxing massage with selected essential oils',
    'Entspannende Massage mit ausgewählten ätherischen Ölen',
    75.00,
    'EUR',
    60,
    'published',
    2
  ),

  -- Beauty Treatments
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '33333333-3333-3333-3333-333333333333',
    'facial-treatment',
    'Trattamento Viso',
    'Facial Treatment',
    'Gesichtsbehandlung',
    'Trattamento viso completo con pulizia profonda e idratazione',
    'Complete facial treatment with deep cleansing and hydration',
    'Komplette Gesichtsbehandlung mit Tiefenreinigung und Hydratation',
    95.00,
    'EUR',
    90,
    'published',
    3
  ),

  -- Spa Package
  (
    '10101010-1010-1010-1010-101010101010',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    'wellness-day-package',
    'Pacchetto Giornata Wellness',
    'Wellness Day Package',
    'Wellness-Tagespaket',
    'Giornata completa: accesso spa, massaggio e trattamento viso',
    'Full day: spa access, massage and facial treatment',
    'Ganzer Tag: Spa-Zugang, Massage und Gesichtsbehandlung',
    180.00,
    'EUR',
    300,
    'published',
    4
  );

-- ============================================
-- 6. INSERT PRICING AVAILABILITY
-- ============================================

INSERT INTO pricing_availability (
  id, product_id, site_id,
  start_date, end_date,
  start_time, end_time,
  price, currency,
  max_capacity, current_bookings, status,
  days_of_week
)
VALUES
  -- Hot Stone Massage - Weekdays
  (
    '20202020-2020-2020-2020-202020202020',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '33333333-3333-3333-3333-333333333333',
    '2025-01-01', '2025-12-31',
    '09:00:00', '20:00:00',
    85.00, 'EUR',
    4, 0, 'active',
    JSON_ARRAY('monday', 'tuesday', 'wednesday', 'thursday', 'friday')
  ),

  -- Hot Stone Massage - Weekend (higher price)
  (
    '30303030-3030-3030-3030-303030303030',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '33333333-3333-3333-3333-333333333333',
    '2025-01-01', '2025-12-31',
    '09:00:00', '20:00:00',
    95.00, 'EUR',
    4, 0, 'active',
    JSON_ARRAY('saturday', 'sunday')
  ),

  -- Wellness Package - All days
  (
    '40404040-4040-4040-4040-404040404040',
    '10101010-1010-1010-1010-101010101010',
    '33333333-3333-3333-3333-333333333333',
    '2025-01-01', '2025-12-31',
    '09:00:00', '18:00:00',
    180.00, 'EUR',
    2, 0, 'active',
    JSON_ARRAY('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
  );

-- ============================================
-- 7. INSERT SAMPLE USER
-- ============================================

INSERT INTO users (id, tenant_id, email, first_name, last_name, role, status)
VALUES
  (
    '50505050-5050-5050-5050-505050505050',
    '11111111-1111-1111-1111-111111111111',
    'admin@demohotels.com',
    'Demo',
    'Admin',
    'admin',
    'active'
  ),
  (
    '60606060-6060-6060-6060-606060606060',
    '11111111-1111-1111-1111-111111111111',
    'manager@demohotels.com',
    'Demo',
    'Manager',
    'manager',
    'active'
  );

-- ============================================
-- Verify inserted data
-- ============================================

SELECT 'Tenants' AS table_name, COUNT(*) AS count FROM tenants
UNION ALL
SELECT 'Vendors', COUNT(*) FROM vendors
UNION ALL
SELECT 'Sites', COUNT(*) FROM sites
UNION ALL
SELECT 'Categories', COUNT(*) FROM service_categories
UNION ALL
SELECT 'Products', COUNT(*) FROM service_products
UNION ALL
SELECT 'Pricing', COUNT(*) FROM pricing_availability
UNION ALL
SELECT 'Users', COUNT(*) FROM users;

SELECT 'Sample data inserted successfully!' AS message;
