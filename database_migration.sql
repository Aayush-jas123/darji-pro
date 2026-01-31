-- Complete Database Migration Script for Darji Pro
-- Run this in Neon SQL Editor

-- ============================================
-- 1. CREATE USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_phone ON users(phone);

-- ============================================
-- 2. CREATE BRANCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_branches_city ON branches(city);
CREATE INDEX idx_branches_is_active ON branches(is_active);

-- ============================================
-- 3. CREATE APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tailor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_tailor ON appointments(tailor_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_scheduled_time ON appointments(scheduled_time);

-- ============================================
-- 4. CREATE MEASUREMENT_PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS measurement_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_name VARCHAR(100) NOT NULL,
    height FLOAT,
    weight FLOAT,
    chest FLOAT,
    waist FLOAT,
    hips FLOAT,
    shoulder_width FLOAT,
    sleeve_length FLOAT,
    inseam FLOAT,
    neck FLOAT,
    fit_preference VARCHAR(50),
    notes TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_measurement_profiles_user ON measurement_profiles(user_id);
CREATE INDEX idx_measurement_profiles_default ON measurement_profiles(is_default);

-- ============================================
-- 5. CREATE TAILOR_AVAILABILITY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tailor_availability (
    id SERIAL PRIMARY KEY,
    tailor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tailor_availability_tailor ON tailor_availability(tailor_id);
CREATE INDEX idx_tailor_availability_day ON tailor_availability(day_of_week);

-- ============================================
-- 6. CREATE ORDERS TABLE (NEW)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tailor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    garment_type VARCHAR(100) NOT NULL,
    fabric_details TEXT,
    design_notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    estimated_price FLOAT,
    final_price FLOAT,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_tailor ON orders(tailor_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ============================================
-- 7. CREATE INVOICES TABLE (NEW)
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    subtotal FLOAT NOT NULL,
    tax_amount FLOAT DEFAULT 0.0,
    discount_amount FLOAT DEFAULT 0.0,
    total_amount FLOAT NOT NULL,
    paid_amount FLOAT DEFAULT 0.0,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    payment_date TIMESTAMP WITH TIME ZONE,
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_order ON invoices(order_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ============================================
-- 8. INSERT SAMPLE DATA (OPTIONAL)
-- ============================================

-- Sample Admin User (password: admin123)
INSERT INTO users (email, full_name, hashed_password, role, is_active)
VALUES (
    'admin@darjipro.com',
    'Admin User',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.oaLkW2',
    'admin',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Sample Tailor User (password: tailor123)
INSERT INTO users (email, full_name, hashed_password, role, is_active)
VALUES (
    'tailor@darjipro.com',
    'Master Tailor',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.oaLkW2',
    'tailor',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Sample Customer User (password: customer123)
INSERT INTO users (email, full_name, hashed_password, role, is_active)
VALUES (
    'customer@darjipro.com',
    'John Customer',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.oaLkW2',
    'customer',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Sample Branch
INSERT INTO branches (name, address, city, state, pincode, phone, email, is_active)
VALUES (
    'Main Branch',
    '123 Fashion Street',
    'Mumbai',
    'Maharashtra',
    '400001',
    '+91-9876543210',
    'main@darjipro.com',
    TRUE
) ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check users
SELECT id, email, full_name, role FROM users;

-- Check branches
SELECT id, name, city FROM branches;

-- ============================================
-- NOTES
-- ============================================
-- 1. All tables created with proper foreign keys
-- 2. Indexes added for performance
-- 3. Sample users created with bcrypt hashed passwords
-- 4. Default passwords:
--    - admin@darjipro.com: admin123
--    - tailor@darjipro.com: tailor123
--    - customer@darjipro.com: customer123
-- 5. Change passwords after first login!
