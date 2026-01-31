"""Search API endpoints."""

from typing import Annotated, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.order import Order
from app.models.appointment import Appointment

router = APIRouter()


@router.get("/orders")
async def search_orders(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    query: str = Query(..., min_length=1, description="Search query"),
):
    """Search orders by order number or garment type."""
    
    search_pattern = f"%{query}%"
    
    # Build query based on user role
    stmt = select(Order).where(
        or_(
            Order.order_number.ilike(search_pattern),
            Order.garment_type.ilike(search_pattern)
        )
    )
    
    # Apply role-based filtering
    if current_user.role.value == "customer":
        stmt = stmt.where(Order.customer_id == current_user.id)
    elif current_user.role.value == "tailor":
        stmt = stmt.where(Order.tailor_id == current_user.id)
    
    stmt = stmt.limit(20)
    result = await db.execute(stmt)
    orders = result.scalars().all()
    
    return orders


@router.get("/customers")
async def search_customers(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    query: str = Query(..., min_length=1, description="Search query"),
):
    """Search customers by name or email. Admin/Tailor only."""
    
    if current_user.role.value not in ["admin", "tailor"]:
        return []
    
    search_pattern = f"%{query}%"
    
    stmt = select(User).where(
        User.role == "customer",
        or_(
            User.full_name.ilike(search_pattern),
            User.email.ilike(search_pattern),
            User.phone.ilike(search_pattern) if User.phone else False
        )
    ).limit(20)
    
    result = await db.execute(stmt)
    customers = result.scalars().all()
    
    return customers


@router.get("/appointments")
async def search_appointments(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format"),
    service_type: Optional[str] = Query(None, description="Service type"),
):
    """Search appointments by date or service type."""
    
    stmt = select(Appointment)
    
    # Apply role-based filtering
    if current_user.role.value == "customer":
        stmt = stmt.where(Appointment.customer_id == current_user.id)
    elif current_user.role.value == "tailor":
        stmt = stmt.where(Appointment.tailor_id == current_user.id)
    
    # Apply search filters
    if date:
        from datetime import datetime
        try:
            search_date = datetime.strptime(date, "%Y-%m-%d")
            stmt = stmt.where(
                Appointment.scheduled_time >= search_date,
                Appointment.scheduled_time < datetime(search_date.year, search_date.month, search_date.day, 23, 59, 59)
            )
        except ValueError:
            pass
    
    if service_type:
        stmt = stmt.where(Appointment.service_type.ilike(f"%{service_type}%"))
    
    stmt = stmt.limit(20).order_by(Appointment.scheduled_time.desc())
    result = await db.execute(stmt)
    appointments = result.scalars().all()
    
    return appointments
