"""Create or update fabrics table with all required fields."""

import asyncio
from sqlalchemy import text
from app.core.database import engine

async def setup_fabrics_table():
    """Create or update the fabrics table."""
    async with engine.begin() as conn:
        try:
            # Check if table exists
            result = await conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'fabrics'
                )
            """))
            table_exists = result.scalar()
            
            if not table_exists:
                print("Creating fabrics table...")
                await conn.execute(text("""
                    CREATE TABLE fabrics (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        type VARCHAR(50) NOT NULL,
                        color VARCHAR(50),
                        pattern VARCHAR(50),
                        price_per_meter FLOAT NOT NULL,
                        image_url VARCHAR,
                        description TEXT,
                        in_stock BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
                    )
                """))
                print("✅ Created fabrics table")
                
                # Create indexes
                await conn.execute(text("""
                    CREATE INDEX idx_fabrics_type ON fabrics(type)
                """))
                await conn.execute(text("""
                    CREATE INDEX idx_fabrics_color ON fabrics(color)
                """))
                print("✅ Created indexes")
                
            else:
                print("Fabrics table exists. Adding missing columns...")
                
                # Add columns if they don't exist
                await conn.execute(text("""
                    ALTER TABLE fabrics 
                    ADD COLUMN IF NOT EXISTS color VARCHAR(50)
                """))
                
                await conn.execute(text("""
                    ALTER TABLE fabrics 
                    ADD COLUMN IF NOT EXISTS pattern VARCHAR(50)
                """))
                
                await conn.execute(text("""
                    ALTER TABLE fabrics 
                    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                """))
                
                await conn.execute(text("""
                    ALTER TABLE fabrics 
                    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                """))
                
                # Create indexes if they don't exist
                await conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_fabrics_color ON fabrics(color)
                """))
                
                print("✅ Updated fabrics table")
            
            print("\n🎉 Fabrics table setup completed successfully!")
            
        except Exception as e:
            print(f"❌ Setup failed: {e}")
            import traceback
            traceback.print_exc()
            raise

if __name__ == "__main__":
    print("🔧 Setting up Fabrics Table")
    print("=" * 50)
    asyncio.run(setup_fabrics_table())
