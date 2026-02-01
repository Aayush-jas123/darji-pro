-- ============================================
-- CHUNK 1: Create ENUM Types
-- Run this FIRST in Neon SQL Editor
-- ============================================

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

-- Verify
SELECT 'CHUNK 1 COMPLETE: ENUM types created!' as status;
