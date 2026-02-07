"""Comprehensive database setup endpoint."""

from fastapi import APIRouter
from app.core.database import engine, AsyncSessionLocal
from app.core.security import get_password_hash

router = APIRouter()


@router.get("/create-all-tables")
async def create_all_tables():
    """Create ALL database tables using SQLAlchemy metadata (includes fabrics table!)"""
    try:
        from app.models import Base
        from app.models.user import User, UserRole
        from app.models.branch import Branch
        
        async with engine.begin() as conn:
            # Drop all tables first
            await conn.run_sync(Base.metadata.drop_all)
            # Create all tables (including fabrics!)
            await conn.run_sync(Base.metadata.create_all)
        
        # Create admin user and main branch
        async with AsyncSessionLocal() as db:
            admin = User(
                email="admin@darjipro.com",
                phone="+919876543210",
                full_name="Admin User",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,
            )
            db.add(admin)
            
            branch = Branch(
                name="Main Branch",
                code="MAIN001",
                address="123 Main Street",
                city="Delhi",
                state="Delhi",
                pincode="110001",
                phone="+911234567890",
                email="main@darjipro.com",
                is_active=True,
            )
            db.add(branch)
            
            await db.commit()
        
        return {
            "status": "success",
            "message": "✅ All tables created successfully (including fabrics table)!",
            "tables_created": [
                "users", "branches", "appointments", "measurements", 
                "orders", "invoices", "fabrics", "tailor_availability"
            ],
            "next_steps": [
                "1. Visit /api/diagnostics/seed-users to create test users",
                "2. Visit /api/fabric-seed/seed-fabrics to add fabric catalog"
            ]
        }
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc(),
            "message": "Failed to create tables"
        }
