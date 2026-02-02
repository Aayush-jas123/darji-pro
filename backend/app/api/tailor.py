"""Tailor API routes for dashboard and appointment management."""

from typing import Annotated, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.appointment import Appointment, AppointmentStatus
from app.models.measurement import MeasurementProfile

router = APIRouter()

# Tailor-only dependency
get_tailor_user = require_role([UserRole.TAILOR.value])


@router.get("/stats")
async def get_tailor_stats(
    current_user: Annotated[User, Depends(get_tailor_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Get dashboard statistics for tailor.
    
    Returns:
        - Total assigned appointments
        - Pending appointments
        - Completed today
        - This week's appointments
    """
    # Total assigned appointments
    total_result = await db.execute(
        select(func.count(Appointment.id)).where(
            Appointment.tailor_id == current_user.id
        )
    )
    total_appointments = total_result.scalar()
    
    # Pending appointments
    pending_result = await db.execute(
        select(func.count(Appointment.id)).where(
            and_(
                Appointment.tailor_id == current_user.id,
                Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED])
            )
        )
    )
    pending_appointments = pending_result.scalar()
    
    # Completed today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    
    completed_today_result = await db.execute(
        select(func.count(Appointment.id)).where(
            and_(
                Appointment.tailor_id == current_user.id,
                Appointment.status == AppointmentStatus.COMPLETED,
                Appointment.updated_at >= today_start,
                Appointment.updated_at < today_end
            )
        )
    )
    completed_today = completed_today_result.scalar()
    
    # This week's appointments
    week_start = datetime.utcnow() - timedelta(days=datetime.utcnow().weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    week_end = week_start + timedelta(days=7)
    
    week_result = await db.execute(
        select(func.count(Appointment.id)).where(
            and_(
                Appointment.tailor_id == current_user.id,
                Appointment.scheduled_time >= week_start,
                Appointment.scheduled_time < week_end
            )
        )
    )
    week_appointments = week_result.scalar()
    
    # Today's appointments
    today_result = await db.execute(
        select(func.count(Appointment.id)).where(
            and_(
                Appointment.tailor_id == current_user.id,
                Appointment.scheduled_time >= today_start,
                Appointment.scheduled_time < today_end
            )
        )
    )
    today_appointments = today_result.scalar()
    
    return {
        "total_assigned": total_appointments,
        "pending": pending_appointments,
        "completed_today": completed_today,
        "week_appointments": week_appointments,
        "today_appointments": today_appointments,
    }


@router.get("/appointments")
async def get_tailor_appointments(
    current_user: Annotated[User, Depends(get_tailor_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    status: Optional[str] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """
    Get tailor's assigned appointments.
    
    Tailor only sees their own appointments.
    """
    query = select(Appointment).where(Appointment.tailor_id == current_user.id)
    
    # Apply status filter
    if status:
        query = query.where(Appointment.status == status)
    
    # Apply pagination and ordering
    query = query.offset(skip).limit(limit).order_by(Appointment.scheduled_time.desc())
    
    # Execute query
    result = await db.execute(query)
    appointments = result.scalars().all()
    
    return appointments


@router.patch("/appointments/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: int,
    current_user: Annotated[User, Depends(get_tailor_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    status: str = Query(..., description="New status"),
    notes: Optional[str] = Query(None, description="Optional notes"),
):
    """
    Update appointment status.
    
    Tailor can only update their own assigned appointments.
    """
    # Get appointment
    result = await db.execute(
        select(Appointment).where(Appointment.id == appointment_id)
    )
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Verify tailor owns this appointment
    if appointment.tailor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own appointments"
        )
    
    # Update status
    try:
        appointment.status = AppointmentStatus(status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    # Update notes if provided
    if notes:
        appointment.notes = notes
    
    await db.commit()
    await db.refresh(appointment)
    
    return {
        "message": "Appointment updated successfully",
        "appointment_id": appointment.id,
        "status": appointment.status.value,
    }


@router.get("/appointments/{appointment_id}/measurements")
async def get_appointment_measurements(
    appointment_id: int,
    current_user: Annotated[User, Depends(get_tailor_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Get customer measurements for an appointment.
    
    Tailor can only view measurements for their assigned appointments.
    """
    # Get appointment
    result = await db.execute(
        select(Appointment).where(Appointment.id == appointment_id)
    )
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Verify tailor owns this appointment
    if appointment.tailor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only view measurements for your own appointments"
        )
    
    # Get customer's default measurement profile
    profile_result = await db.execute(
        select(MeasurementProfile).where(
            and_(
                MeasurementProfile.user_id == appointment.customer_id,
                MeasurementProfile.is_default == True
            )
        )
    )
    profile = profile_result.scalar_one_or_none()
    
    if not profile:
        return {
            "message": "No measurements found for this customer",
            "appointment_id": appointment_id,
            "customer_id": appointment.customer_id,
        }
    
    return profile


@router.get("/availability")
async def get_tailor_availability(
    current_user: Annotated[User, Depends(get_tailor_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Get tailor's current availability schedule.
    """
    from app.models.branch import TailorAvailability, DayOfWeek
    
    # Get availability
    result = await db.execute(
        select(TailorAvailability)
        .where(TailorAvailability.tailor_id == current_user.id)
        .order_by(TailorAvailability.id) # Should ideally order by day, but enum sorting is tricky in SQL
    )
    availability = result.scalars().all()
    
    # Map to simplified schema
    # Sort by day of week
    day_order = {
        DayOfWeek.MONDAY: 0, DayOfWeek.TUESDAY: 1, DayOfWeek.WEDNESDAY: 2,
        DayOfWeek.THURSDAY: 3, DayOfWeek.FRIDAY: 4, DayOfWeek.SATURDAY: 5,
        DayOfWeek.SUNDAY: 6
    }
    
    availability = sorted(availability, key=lambda x: day_order.get(x.day_of_week, 7))
    
    return [
        {
            "day_of_week": a.day_of_week,
            "start_time": a.start_time,
            "end_time": a.end_time,
            "is_active": a.is_active
        }
        for a in availability
    ]


@router.post("/availability")
async def update_tailor_availability(
    settings: list[dict], # Using dict to avoid circular imports, validated manually or via schema
    current_user: Annotated[User, Depends(get_tailor_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Update tailor's availability schedule.
    Expects a list of {day_of_week, start_time, end_time, is_active}.
    """
    from app.models.branch import TailorAvailability, DayOfWeek
    
    # Clear existing availability (simplest strategy for bulk update)
    # Alternatively, update in place. Let's update in place or insert.
    
    # For now, we assume Branch ID 1 (Main Branch)
    branch_id = 1
    
    for setting in settings:
        day = setting.get('day_of_week')
        if not day:
            continue
            
        # Check if entry exists
        result = await db.execute(
            select(TailorAvailability).where(
                and_(
                    TailorAvailability.tailor_id == current_user.id,
                    TailorAvailability.day_of_week == day
                )
            )
        )
        existing = result.scalar_one_or_none()
        
        # Parse times
        try:
            start_str = setting.get('start_time')
            end_str = setting.get('end_time')
            
            # Simple string to time conversion if needed, or assume Pydantic handled it (if we used schema)
            # Since we used dict, let's be safe.
            from datetime import time
            if isinstance(start_str, str):
                h, m = map(int, start_str.split(':')[:2])
                start_time = time(h, m)
            else:
                start_time = start_str
                
            if isinstance(end_str, str):
                h, m = map(int, end_str.split(':')[:2])
                end_time = time(h, m)
            else:
                end_time = end_str
                
        except Exception:
            raise HTTPException(status_code=400, detail=f"Invalid time format for {day}")
            
        if existing:
            existing.start_time = start_time
            existing.end_time = end_time
            existing.is_active = setting.get('is_active', True)
        else:
            new_avail = TailorAvailability(
                tailor_id=current_user.id,
                branch_id=branch_id,
                day_of_week=day,
                start_time=start_time,
                end_time=end_time,
                is_active=setting.get('is_active', True)
            )
            db.add(new_avail)
            
    await db.commit()
    return {"message": "Availability updated successfully"}
