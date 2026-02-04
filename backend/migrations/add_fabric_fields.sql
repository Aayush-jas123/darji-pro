-- Add new columns to fabrics table
ALTER TABLE fabrics 
ADD COLUMN IF NOT EXISTS color VARCHAR(50),
ADD COLUMN IF NOT EXISTS pattern VARCHAR(50),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index on color for faster filtering
CREATE INDEX IF NOT EXISTS idx_fabrics_color ON fabrics(color);

-- Update existing records to have timestamps
UPDATE fabrics 
SET created_at = CURRENT_TIMESTAMP, 
    updated_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;
