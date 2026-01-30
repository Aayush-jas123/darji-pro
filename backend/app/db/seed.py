"""Database seeding script for development data."""

import asyncio
from datetime import datetime, time
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.branch import Branch, TailorAvailability, DayOfWeek


async def seed_database():
    """Seed the database with initial development data."""
    async with AsyncSessionLocal() as db:
        print("🌱 Seeding database...")
        
        # Create admin user
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
        
        # Create tailor users
        tailor1 = User(
            email="tailor1@darjipro.com",
            phone="+919876543211",
            full_name="Rajesh Kumar",
            hashed_password=get_password_hash("tailor123"),
            role=UserRole.TAILOR,
            is_active=True,
            is_verified=True,
        )
        db.add(tailor1)
        
        tailor2 = User(
            email="tailor2@darjipro.com",
            phone="+919876543212",
            full_name="Amit Sharma",
            hashed_password=get_password_hash("tailor123"),
            role=UserRole.TAILOR,
            is_active=True,
            is_verified=True,
        )
        db.add(tailor2)
        
        # Create customer users
        customer1 = User(
            email="customer@example.com",
            phone="+919876543213",
            full_name="John Doe",
            hashed_password=get_password_hash("customer123"),
            role=UserRole.CUSTOMER,
            is_active=True,
            is_verified=True,
        )
        db.add(customer1)
        
        customer2 = User(
            email="vip@example.com",
            phone="+919876543214",
            full_name="VIP Customer",
            hashed_password=get_password_hash("customer123"),
            role=UserRole.CUSTOMER,
            is_active=True,
            is_verified=True,
            is_priority=True,
        )
        db.add(customer2)
        
        await db.flush()  # Get user IDs
        
        # Create branches
        branch1 = Branch(
            name="Main Branch - Delhi",
            code="DL001",
            address="123 Connaught Place",
            city="New Delhi",
            state="Delhi",
            pincode="110001",
            phone="+911123456789",
            email="delhi@darjipro.com",
            is_active=True,
        )
        db.add(branch1)
        
        branch2 = Branch(
            name="Mumbai Branch",
            code="MH001",
            address="456 Colaba Causeway",
            city="Mumbai",
            state="Maharashtra",
            pincode="400001",
            phone="+912223456789",
            email="mumbai@darjipro.com",
            is_active=True,
        )
        db.add(branch2)
        
        await db.flush()  # Get branch IDs
        
        # Create tailor availability
        # Tailor 1 - Monday to Friday at Branch 1
        for day in [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, 
                    DayOfWeek.THURSDAY, DayOfWeek.FRIDAY]:
            availability = TailorAvailability(
                tailor_id=tailor1.id,
                branch_id=branch1.id,
                day_of_week=day,
                start_time=time(9, 0),
                end_time=time(18, 0),
                slot_duration_minutes=30,
                buffer_time_minutes=10,
                max_appointments_per_day=16,
                is_active=True,
            )
            db.add(availability)
        
        # Tailor 2 - Monday to Saturday at Branch 2
        for day in [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, 
                    DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY]:
            availability = TailorAvailability(
                tailor_id=tailor2.id,
                branch_id=branch2.id,
                day_of_week=day,
                start_time=time(10, 0),
                end_time=time(19, 0),
                slot_duration_minutes=30,
                buffer_time_minutes=15,
                max_appointments_per_day=14,
                is_active=True,
            )
            db.add(availability)
        
        await db.commit()
        
        print("✅ Database seeded successfully!")
        print("\n📋 Test Accounts Created:")
        print(f"   Admin: admin@darjipro.com / admin123")
        print(f"   Tailor 1: tailor1@darjipro.com / tailor123")
        print(f"   Tailor 2: tailor2@darjipro.com / tailor123")
        print(f"   Customer: customer@example.com / customer123")
        print(f"   VIP Customer: vip@example.com / customer123")
        print(f"\n🏢 Branches Created:")
        print(f"   {branch1.name} ({branch1.code})")
        print(f"   {branch2.name} ({branch2.code})")


if __name__ == "__main__":
    asyncio.run(seed_database())
