"""Add color, pattern, and timestamps to fabrics table."""

import asyncio
from sqlalchemy import text
from app.core.database import engine

async def run_migration():
    """Run the migration to add new fields to fabrics table."""
    async with engine.begin() as conn:
        try:
            print("Adding new columns to fabrics table...")
            
            # Add color column
            await conn.execute(text("""
                ALTER TABLE fabrics 
                ADD COLUMN IF NOT EXISTS color VARCHAR(50)
            """))
            print("✅ Added color column")
            
            # Add pattern column
            await conn.execute(text("""
                ALTER TABLE fabrics 
                ADD COLUMN IF NOT EXISTS pattern VARCHAR(50)
            """))
            print("✅ Added pattern column")
            
            # Add created_at column
            await conn.execute(text("""
                ALTER TABLE fabrics 
                ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            """))
            print("✅ Added created_at column")
            
            # Add updated_at column
            await conn.execute(text("""
                ALTER TABLE fabrics 
                ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            """))
            print("✅ Added updated_at column")
            
            # Create index on color
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_fabrics_color ON fabrics(color)
            """))
            print("✅ Created index on color")
            
            # Update existing records
            await conn.execute(text("""
                UPDATE fabrics 
                SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
                    updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
            """))
            print("✅ Updated existing records with timestamps")
            
            print("\n🎉 Migration completed successfully!")
            
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            import traceback
            traceback.print_exc()
            raise

if __name__ == "__main__":
    print("🔧 Running Fabric Table Migration")
    print("=" * 50)
    asyncio.run(run_migration())
