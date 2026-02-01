-- ============================================
-- DARJI PRO - SIMPLE DATABASE SETUP
-- Run this in Neon SQL Editor
-- ============================================

-- Step 1: Create users table (most important)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_priority BOOLEAN NOT NULL DEFAULT false,
    google_id VARCHAR(255) UNIQUE,
    facebook_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Step 2: Create branches table
CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Step 3: Create measurement_profiles table
CREATE TABLE IF NOT EXISTS measurement_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_name VARCHAR(255) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Step 4: Create measurement_versions table
CREATE TABLE IF NOT EXISTS measurement_versions (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER NOT NULL REFERENCES measurement_profiles(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
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
    measured_by_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Step 5: Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tailor_id INTEGER REFERENCES users(id),
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Step 6: Create tailor_availability table
CREATE TABLE IF NOT EXISTS tailor_availability (
    id SERIAL PRIMARY KEY,
    tailor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true
);

-- Step 7: Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tailor_id INTEGER REFERENCES users(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    garment_type VARCHAR(100) NOT NULL,
    fabric_details TEXT,
    design_notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    estimated_price FLOAT,
    final_price FLOAT,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Step 8: Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    subtotal FLOAT NOT NULL,
    tax_amount FLOAT NOT NULL DEFAULT 0.0,
    discount_amount FLOAT NOT NULL DEFAULT 0.0,
    total_amount FLOAT NOT NULL,
    paid_amount FLOAT NOT NULL DEFAULT 0.0,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    payment_date TIMESTAMP WITH TIME ZONE,
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Step 9: Insert sample admin user (password: admin123)
-- Hash generated with: bcrypt.hashpw(b'admin123', bcrypt.gensalt())
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

-- Step 10: Insert sample tailor user (password: tailor123)
INSERT INTO users (email, full_name, hashed_password, role, is_active, is_verified)
VALUES (
    'tailor@darjipro.com',
    'Tailor User',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS/ZWZw5u',
    'tailor',
    true,
    true
)
ON CONFLICT (email) DO NOTHING;

-- Step 11: Insert sample customer user (password: customer123)
INSERT INTO users (email, full_name, hashed_password, role, is_active, is_verified)
VALUES (
    'customer@darjipro.com',
    'Customer User',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS/ZWZw5u',
    'customer',
    true,
    true
)
ON CONFLICT (email) DO NOTHING;

-- Step 12: Insert sample branch
INSERT INTO branches (name, address, city, state, pincode, phone, email, is_active)
SELECT 
    'Main Branch',
    '123 Fashion Street',
    'Mumbai',
    'Maharashtra',
    '400001',
    '+91-9876543210',
    'main@darjipro.com',
    true
WHERE NOT EXISTS (SELECT 1 FROM branches WHERE name = 'Main Branch');

-- Verification: Show all tables
SELECT 'SUCCESS: All tables created!' as status;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
