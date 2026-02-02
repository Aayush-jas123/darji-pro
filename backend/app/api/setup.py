from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from app.core.database import engine

router = APIRouter()

from app.core.security import get_password_hash

@router.get("/setup-database-emergency")
async def setup_database():
    """Run the database setup SQL directly from the server."""
    
    try:
        # Generate hash dynamically
        admin_password_hash = get_password_hash("admin123")
        
        sql_script = """
    -- DROP EVERYTHING FIRST (Clean Slate)
    DROP TABLE IF EXISTS invoices CASCADE;
    DROP TABLE IF EXISTS orders CASCADE;
    DROP TABLE IF EXISTS tailor_availability CASCADE;
    DROP TABLE IF EXISTS appointments CASCADE;
    DROP TABLE IF EXISTS measurement_versions CASCADE;
    DROP TABLE IF EXISTS measurement_profiles CASCADE;
    DROP TABLE IF EXISTS branches CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    
    -- Drop ENUMs if they exist to avoid conflicts
    DROP TYPE IF EXISTS userrole CASCADE;
    DROP TYPE IF EXISTS appointmentstatus CASCADE;
    DROP TYPE IF EXISTS orderstatus CASCADE;
    DROP TYPE IF EXISTS invoicestatus CASCADE;
    DROP TYPE IF EXISTS paymentmethod CASCADE;

    -- Create users table (using VARCHAR for role to be safe)
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        full_name VARCHAR(255) NOT NULL,
        hashed_password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'customer',
        is_active BOOLEAN DEFAULT true,
        is_verified BOOLEAN DEFAULT false,
        is_priority BOOLEAN DEFAULT false,
        google_id VARCHAR(255),
        facebook_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
    );

    -- Create branches table
    CREATE TABLE branches (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        pincode VARCHAR(10) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create measurement_profiles table
    CREATE TABLE measurement_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        profile_name VARCHAR(255) NOT NULL,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create measurement_versions table
    CREATE TABLE measurement_versions (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER REFERENCES measurement_profiles(id) ON DELETE CASCADE,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create appointments table
    CREATE TABLE appointments (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        tailor_id INTEGER REFERENCES users(id),
        branch_id INTEGER REFERENCES branches(id),
        scheduled_time TIMESTAMP NOT NULL,
        service_type VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create tailor_availability table
    CREATE TABLE tailor_availability (
        id SERIAL PRIMARY KEY,
        tailor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available BOOLEAN DEFAULT true
    );

    -- Create orders table
    CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
        customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        tailor_id INTEGER REFERENCES users(id),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        garment_type VARCHAR(100) NOT NULL,
        fabric_details TEXT,
        design_notes TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        estimated_price FLOAT,
        final_price FLOAT,
        estimated_delivery TIMESTAMP,
        actual_delivery TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create invoices table
    CREATE TABLE invoices (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        subtotal FLOAT NOT NULL,
        tax_amount FLOAT DEFAULT 0.0,
        discount_amount FLOAT DEFAULT 0.0,
        total_amount FLOAT NOT NULL,
        paid_amount FLOAT DEFAULT 0.0,
        status VARCHAR(50) DEFAULT 'draft',
        payment_method VARCHAR(50),
        payment_reference VARCHAR(255),
        payment_date TIMESTAMP,
        issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        due_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Insert admin user (password: admin123)
    INSERT INTO users (email, full_name, hashed_password, role, is_active, is_verified)
    VALUES ('admin@darjipro.com', 'Admin User', '{admin_password_hash}', 'admin', true, true);

    -- Insert sample branch
    INSERT INTO branches (name, address, city, state, pincode, phone, email)
    VALUES ('Main Branch', '123 Fashion Street', 'Mumbai', 'Maharashtra', '400001', '+91-9876543210', 'main@darjipro.com');
    """

    # Inject the hash
        sql_script = sql_script.format(admin_password_hash=admin_password_hash)

        async with engine.begin() as conn:
            # Split by statement to execute one by one
            statements = sql_script.split(";")
            for stmt in statements:
                if stmt.strip():
                    await conn.execute(text(stmt))
        
        return {"status": "success", "message": "Database tables created successfully!"}
    
    except Exception as e:
        return {"status": "error", "message": str(e)}
