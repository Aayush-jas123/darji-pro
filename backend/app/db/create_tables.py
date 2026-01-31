"""Create database tables directly using SQLAlchemy (alternative to Alembic)."""

import asyncio
import ssl
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
    
    # Create SSL context for Neon
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    # Create async engine
    engine = create_async_engine(
        settings.DATABASE_URL.split('?')[0],  # Remove query params
        echo=True,
        pool_pre_ping=True,
        connect_args={
            "ssl": ssl_context,
            "server_settings": {"jit": "off"}
        }
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
