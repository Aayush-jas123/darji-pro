"""Create database tables directly using SQLAlchemy (alternative to Alembic)."""

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings
from app.core.database import Base

# Import all models to ensure they're registered
from app.models.user import User
from app.models.branch import Branch, TailorAvailability
from app.models.appointment import Appointment
from app.models.measurement import MeasurementProfile, MeasurementVersion
from app.models.system import AuditLog, Notification


async def create_tables():
    """Create all database tables."""
    print("🗄️  Creating database tables...")
    print(f"📊 Database: {settings.DATABASE_URL[:50]}...")
    
    # Create async engine
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=True,
        pool_pre_ping=True,
    )
    
    try:
        async with engine.begin() as conn:
            # Drop all tables (careful in production!)
            # await conn.run_sync(Base.metadata.drop_all)
            
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
        
        print("✅ Database tables created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        raise
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(create_tables())
