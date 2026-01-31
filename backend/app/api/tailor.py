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
