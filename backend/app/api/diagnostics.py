"""Database diagnostic and fix endpoint."""

from fastapi import APIRouter, Depends
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User, UserRole

router = APIRouter()


@router.get("/check-users")
async def check_users(db: AsyncSession = Depends(get_db)):
    """Check all users and their roles in the database."""
    try:
        result = await db.execute(
            select(User.id, User.email, User.role, User.full_name, User.is_active)
        )
        users = result.all()
        
        user_list = []
        for user in users:
            user_list.append({
                "id": user.id,
                "email": user.email,
                "role": str(user.role) if hasattr(user.role, 'value') else user.role,
                "role_value": user.role.value if hasattr(user.role, 'value') else user.role,
                "full_name": user.full_name,
                "is_active": user.is_active,
            })
        
        return {
            "total_users": len(user_list),
            "users": user_list,
            "message": "Database check complete"
        }
    except Exception as e:
        return {
            "error": str(e),
            "message": "Failed to check database"
        }


@router.post("/fix-user-roles")
async def fix_user_roles(db: AsyncSession = Depends(get_db)):
    """Fix user roles by ensuring they are set correctly."""
    try:
        # Get all users
        result = await db.execute(select(User))
        users = result.scalars().all()
        
        fixed_users = []
        for user in users:
            # Check if role needs fixing
            if user.email == "admin@darjipro.com":
                if user.role != UserRole.ADMIN:
                    user.role = UserRole.ADMIN
                    fixed_users.append(f"{user.email} -> ADMIN")
            elif user.email.startswith("tailor"):
                if user.role != UserRole.TAILOR:
                    user.role = UserRole.TAILOR
                    fixed_users.append(f"{user.email} -> TAILOR")
            elif user.role != UserRole.CUSTOMER:
                user.role = UserRole.CUSTOMER
                fixed_users.append(f"{user.email} -> CUSTOMER")
        
        await db.commit()
        
        return {
            "fixed_count": len(fixed_users),
            "fixed_users": fixed_users,
            "message": "User roles fixed successfully"
        }
    except Exception as e:
        await db.rollback()
        return {
            "error": str(e),
            "message": "Failed to fix user roles"
        }


@router.post("/create-test-users")
async def create_test_users(db: AsyncSession = Depends(get_db)):
    """Create test users with correct roles if they don't exist."""
    try:
        created_users = []
        
        # Check and create admin
        result = await db.execute(select(User).where(User.email == "admin@darjipro.com"))
        admin = result.scalar_one_or_none()
        if not admin:
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
            created_users.append("admin@darjipro.com (ADMIN)")
        
        # Check and create tailor
        result = await db.execute(select(User).where(User.email == "tailor1@darjipro.com"))
        tailor = result.scalar_one_or_none()
        if not tailor:
            tailor = User(
                email="tailor1@darjipro.com",
                phone="+919876543211",
                full_name="Rajesh Kumar",
                hashed_password=get_password_hash("tailor123"),
                role=UserRole.TAILOR,
                is_active=True,
                is_verified=True,
            )
            db.add(tailor)
            created_users.append("tailor1@darjipro.com (TAILOR)")
        
        # Check and create customer
        result = await db.execute(select(User).where(User.email == "customer@example.com"))
        customer = result.scalar_one_or_none()
        if not customer:
            customer = User(
                email="customer@example.com",
                phone="+919876543213",
                full_name="John Doe",
                hashed_password=get_password_hash("customer123"),
                role=UserRole.CUSTOMER,
                is_active=True,
                is_verified=True,
            )
            db.add(customer)
            created_users.append("customer@example.com (CUSTOMER)")
        
        await db.commit()
        
        return {
            "created_count": len(created_users),
            "created_users": created_users,
            "message": "Test users created successfully"
        }
    except Exception as e:
        await db.rollback()
        return {
            "error": str(e),
            "message": "Failed to create test users"
        }


@router.get("/seed-users")
async def seed_users_browser(db: AsyncSession = Depends(get_db)):
    """Browser-accessible endpoint to seed test users. Just visit this URL!"""
    try:
        created_users = []
        updated_users = []
        
        # Check and create/update admin
        result = await db.execute(select(User).where(User.email == "admin@darjipro.com"))
        admin = result.scalar_one_or_none()
        if not admin:
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
            created_users.append("admin@darjipro.com (ADMIN)")
        else:
            if admin.role != UserRole.ADMIN:
                admin.role = UserRole.ADMIN
                updated_users.append(f"admin@darjipro.com -> ADMIN")
        
        # Check and create/update tailor1
        result = await db.execute(select(User).where(User.email == "tailor1@darjipro.com"))
        tailor = result.scalar_one_or_none()
        if not tailor:
            tailor = User(
                email="tailor1@darjipro.com",
                phone="+919876543211",
                full_name="Rajesh Kumar",
                hashed_password=get_password_hash("tailor123"),
                role=UserRole.TAILOR,
                is_active=True,
                is_verified=True,
            )
            db.add(tailor)
            created_users.append("tailor1@darjipro.com (TAILOR)")
        else:
            if tailor.role != UserRole.TAILOR:
                tailor.role = UserRole.TAILOR
                updated_users.append(f"tailor1@darjipro.com -> TAILOR")
        
        # Check and create/update customer
        result = await db.execute(select(User).where(User.email == "customer@example.com"))
        customer = result.scalar_one_or_none()
        if not customer:
            customer = User(
                email="customer@example.com",
                phone="+919876543213",
                full_name="John Doe",
                hashed_password=get_password_hash("customer123"),
                role=UserRole.CUSTOMER,
                is_active=True,
                is_verified=True,
            )
            db.add(customer)
            created_users.append("customer@example.com (CUSTOMER)")
        else:
            if customer.role != UserRole.CUSTOMER:
                customer.role = UserRole.CUSTOMER
                updated_users.append(f"customer@example.com -> CUSTOMER")
        
        await db.commit()
        
        return {
            "status": "success",
            "created_count": len(created_users),
            "updated_count": len(updated_users),
            "created_users": created_users,
            "updated_users": updated_users,
            "test_credentials": {
                "admin": {"email": "admin@darjipro.com", "password": "admin123", "dashboard": "/admin"},
                "tailor": {"email": "tailor1@darjipro.com", "password": "tailor123", "dashboard": "/tailor"},
                "customer": {"email": "customer@example.com", "password": "customer123", "dashboard": "/dashboard"}
            },
            "message": "✅ Test users ready! Clear localStorage and test logins."
        }
    except Exception as e:
        await db.rollback()
        return {
            "status": "error",
            "error": str(e),
            "message": "Failed to seed users"
        }
