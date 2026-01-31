"""Admin API routes for dashboard and management."""

from typing import Annotated, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.appointment import Appointment, AppointmentStatus
from app.schemas.user import UserResponse

router = APIRouter()


# Admin-only dependency
get_admin_user = require_role([UserRole.ADMIN.value])


@router.get("/stats")
async def get_dashboard_stats(
    current_user: Annotated[User, Depends(get_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Get dashboard statistics for admin overview.
    
    Returns:
        - Total users by role
        - Total appointments by status
        - Recent activity counts
    """
    # Count users by role
    user_counts = {}
    for role in UserRole:
        result = await db.execute(
            select(func.count(User.id)).where(User.role == role)
        )
        user_counts[role.value] = result.scalar()
    
    # Count appointments by status
    appointment_counts = {}
    for status in AppointmentStatus:
        result = await db.execute(
            select(func.count(Appointment.id)).where(Appointment.status == status)
        )
        appointment_counts[status.value] = result.scalar()
    
    # Total counts
    total_users_result = await db.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar()
    
    total_appointments_result = await db.execute(select(func.count(Appointment.id)))
    total_appointments = total_appointments_result.scalar()
    
    # Active users (logged in last 30 days)
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    active_users_result = await db.execute(
        select(func.count(User.id)).where(User.last_login >= thirty_days_ago)
    )
    active_users = active_users_result.scalar()
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "by_role": user_counts,
        },
        "appointments": {
            "total": total_appointments,
            "by_status": appointment_counts,
        },
    }


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    current_user: Annotated[User, Depends(get_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    role: Optional[str] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of records to return"),
):
    """
    List all users with optional filters and pagination.
    
    Admin only.
    """
    query = select(User)
    
    # Apply filters
    if role:
        query = query.where(User.role == role)
    
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            (User.full_name.ilike(search_pattern)) | 
            (User.email.ilike(search_pattern))
        )
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    # Execute query
    result = await db.execute(query)
    users = result.scalars().all()
    
    return users


@router.get("/appointments")
async def list_appointments(
    current_user: Annotated[User, Depends(get_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    status: Optional[str] = Query(None, description="Filter by status"),
    customer_id: Optional[int] = Query(None, description="Filter by customer ID"),
    tailor_id: Optional[int] = Query(None, description="Filter by tailor ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """
    List all appointments with optional filters.
    
    Admin only.
    """
    query = select(Appointment)
    
    # Apply filters
    if status:
        query = query.where(Appointment.status == status)
    
    if customer_id:
        query = query.where(Appointment.customer_id == customer_id)
    
    if tailor_id:
        query = query.where(Appointment.tailor_id == tailor_id)
    
    # Apply pagination
    query = query.offset(skip).limit(limit).order_by(Appointment.scheduled_time.desc())
    
    # Execute query
    result = await db.execute(query)
    appointments = result.scalars().all()
    
    return appointments


@router.patch("/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: int,
    current_user: Annotated[User, Depends(get_admin_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Toggle user active status.
    
    Admin only.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = not user.is_active
    await db.commit()
    await db.refresh(user)
    
    return {
        "message": f"User {'activated' if user.is_active else 'deactivated'} successfully",
        "user_id": user.id,
        "is_active": user.is_active,
    }
