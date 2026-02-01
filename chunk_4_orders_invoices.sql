-- ============================================
-- CHUNK 4: Create Orders & Invoices
-- Run this AFTER Chunk 3
-- ============================================

-- Create orders table
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

-- Create invoices table
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

-- Verify
SELECT 'CHUNK 4 COMPLETE: Orders and Invoices tables created!' as status;
