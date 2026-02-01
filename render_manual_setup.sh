#!/usr/bin/env bash
# ============================================
# Run this on Render Shell to setup database
# ============================================

echo "🚀 Starting database setup on Render..."
echo ""

# Navigate to backend directory
cd /opt/render/project/src/backend || cd backend

echo "📦 Installing psycopg2 if needed..."
pip install psycopg2-binary --quiet

echo ""
echo "🗄️ Running Alembic migrations..."
alembic upgrade head

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Verifying tables..."
python << 'PYTHON_SCRIPT'
import asyncio
from app.core.database import engine
from sqlalchemy import text

async def verify_tables():
    async with engine.connect() as conn:
        result = await conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        """))
        tables = result.fetchall()
        print(f"\n✓ Found {len(tables)} tables:")
        for table in tables:
            print(f"  - {table[0]}")

asyncio.run(verify_tables())
PYTHON_SCRIPT

echo ""
echo "🎉 All done! Registration should now work."
