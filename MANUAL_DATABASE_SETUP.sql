-- ============================================
-- DARJI PRO - MANUAL DATABASE SETUP
-- Run this in Neon SQL Editor if Alembic fails
-- ============================================

-- Step 1: Create ENUM types
DO $$ BEGIN
    CREATE TYPE userrole AS ENUM ('customer', 'tailor', 'admin', 'staff');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointmentstatus AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE orderstatus AS ENUM ('pending', 'cutting', 'stitching', 'finishing', 'quality_check', 'ready', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invoicestatus AS ENUM ('draft', 'pending', 'paid', 'partially_paid', 'overdue', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE paymentmethod AS ENUM ('cash', 'card', 'upi', 'bank_transfer', 'razorpay', 'stripe');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role userrole NOT NULL DEFAULT 'customer',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_priority BOOLEAN NOT NULL DEFAULT false,
    google_id VARCHAR(255) UNIQUE,
    facebook_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE INDEX IF NOT EXISTS ix_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS ix_users_id ON users(id);

-- Step 3: Create branches table
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

-- Step 4: Create measurement_profiles table
CREATE TABLE IF NOT EXISTS measurement_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_name VARCHAR(255) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_measurement_profiles_user_id ON measurement_profiles(user_id);

-- Step 5: Create measurement_versions table
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

CREATE INDEX IF NOT EXISTS ix_measurement_versions_profile_id ON measurement_versions(profile_id);

-- Step 6: Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tailor_id INTEGER REFERENCES users(id),
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    status appointmentstatus NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS ix_appointments_scheduled_time ON appointments(scheduled_time);
CREATE INDEX IF NOT EXISTS ix_appointments_status ON appointments(status);

-- Step 7: Create tailor_availability table
CREATE TABLE IF NOT EXISTS tailor_availability (
    id SERIAL PRIMARY KEY,
    tailor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true
);

-- Step 8: Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tailor_id INTEGER REFERENCES users(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    garment_type VARCHAR(100) NOT NULL,
    fabric_details TEXT,
    design_notes TEXT,
    status orderstatus NOT NULL DEFAULT 'pending',
    estimated_price FLOAT,
    final_price FLOAT,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS ix_orders_id ON orders(id);
CREATE INDEX IF NOT EXISTS ix_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS ix_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS ix_orders_tailor_id ON orders(tailor_id);

-- Step 9: Create invoices table
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
    status invoicestatus NOT NULL DEFAULT 'draft',
    payment_method paymentmethod,
    payment_reference VARCHAR(255),
    payment_date TIMESTAMP WITH TIME ZONE,
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS ix_invoices_id ON invoices(id);
CREATE INDEX IF NOT EXISTS ix_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS ix_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS ix_invoices_status ON invoices(status);

-- Step 10: Insert sample admin user (password: admin123)
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

-- Step 11: Insert sample branch
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

-- Verification
SELECT 'Tables created successfully!' as message;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
