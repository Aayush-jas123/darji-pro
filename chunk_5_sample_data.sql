-- ============================================
-- CHUNK 5: Insert Sample Data
-- Run this LAST (after Chunk 4)
-- ============================================

-- Insert sample admin user (password: admin123)
INSERT INTO users (email, full_name, hashed_password, role, is_active, is_verified)
VALUES (
    'admin@darjipro.com',
    'Admin User',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS/ZWZw5u',
    'admin',
    true,
    true
)
ON CONFLICT (email) DO NOTHING;

-- Insert sample branch
INSERT INTO branches (name, address, city, state, pincode, phone, email, is_active)
VALUES (
    'Main Branch',
    '123 Fashion Street',
    'Mumbai',
    'Maharashtra',
    '400001',
    '+91-9876543210',
    'main@darjipro.com',
    true
)
ON CONFLICT DO NOTHING;

-- Final verification
SELECT 'CHUNK 5 COMPLETE: Sample data inserted!' as status;
SELECT '✅ ALL CHUNKS COMPLETE! Database is ready!' as final_status;

-- Show all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
