-- ============================================
-- CHUNK 3: Create Measurements & Appointments
-- Run this AFTER Chunk 2
-- ============================================

-- Create measurement_profiles table
CREATE TABLE IF NOT EXISTS measurement_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_name VARCHAR(255) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_measurement_profiles_user_id ON measurement_profiles(user_id);

-- Create measurement_versions table
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

-- Create appointments table
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

-- Create tailor_availability table
CREATE TABLE IF NOT EXISTS tailor_availability (
    id SERIAL PRIMARY KEY,
    tailor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true
);

-- Verify
SELECT 'CHUNK 3 COMPLETE: Measurements and Appointments tables created!' as status;
