"""Appointment management API routes."""

from datetime import datetime, timedelta
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.appointment import Appointment, AppointmentStatus
from app.models.branch import TailorAvailability
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    AppointmentListResponse,
    AppointmentStatusUpdate,
    AppointmentReschedule,
    AppointmentCancel,
    AvailabilityResponse,
    AvailabilitySlot,
)
from app.schemas.common import MessageResponse

router = APIRouter()


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appointment_data: AppointmentCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Create a new appointment.
    
    - **appointment_type**: Type of appointment (measurement, fitting, etc.)
    - **scheduled_date**: Date and time for appointment
    - **tailor_id**: ID of the tailor
    - **branch_id**: ID of the branch
    """
    # Start transaction and lock the tailor to prevent race conditions
    # This ensures only one appointment can be booked for a tailor at a time
    await db.execute(select(User).where(User.id == appointment_data.tailor_id).with_for_update())

    # Check for conflicts
    conflict_query = select(Appointment).where(
        and_(
            Appointment.tailor_id == appointment_data.tailor_id,
            Appointment.scheduled_date == appointment_data.scheduled_date,
            Appointment.status.in_([
                AppointmentStatus.PENDING,
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.IN_PROGRESS,
            ])
        )
    )
    conflict_result = await db.execute(conflict_query)
    if conflict_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Time slot already booked",
        )
    
    # Create appointment
    new_appointment = Appointment(
        customer_id=current_user.id,
        tailor_id=appointment_data.tailor_id,
        branch_id=appointment_data.branch_id,
        appointment_type=appointment_data.appointment_type,
        scheduled_date=appointment_data.scheduled_date,
        duration_minutes=appointment_data.duration_minutes,
        customer_notes=appointment_data.customer_notes,
        is_priority=appointment_data.is_priority or current_user.is_priority,
        is_rush=appointment_data.is_rush,
        status=AppointmentStatus.PENDING,
    )
    
    db.add(new_appointment)
    await db.commit()
    await db.refresh(new_appointment)
    
    # Send appointment confirmation notification
    from app.services.notification import notification_service
    try:
        await notification_service.send_appointment_confirmation(
            db=db,
            user=current_user,
            appointment_id=new_appointment.id,
            appointment_time=new_appointment.scheduled_date,
            service_type=new_appointment.appointment_type
        )
    except Exception as e:
        # Log error but don't fail the appointment creation
        print(f"Failed to send appointment notification: {e}")
    
    return new_appointment


@router.get("", response_model=AppointmentListResponse)
async def list_appointments(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[AppointmentStatus] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
):
    """
    List appointments.
    
    - Customers see their own appointments
    - Tailors see appointments assigned to them
    - Admins see all appointments
    """
    query = select(Appointment)
    
    # Filter based on user role
    if current_user.is_customer:
        query = query.where(Appointment.customer_id == current_user.id)
    elif current_user.is_tailor:
        query = query.where(Appointment.tailor_id == current_user.id)
    # Admins see all
    
    # Apply filters
    if status:
        query = query.where(Appointment.status == status)
    if from_date:
        query = query.where(Appointment.scheduled_date >= from_date)
    if to_date:
        query = query.where(Appointment.scheduled_date <= to_date)
    
    # Order by scheduled date
    query = query.order_by(Appointment.scheduled_date.desc())
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    # Execute query
    result = await db.execute(query)
    appointments = result.scalars().all()
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "appointments": appointments,
    }


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get appointment by ID."""
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )
    
    # Check permissions
    if current_user.is_customer and appointment.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this appointment",
        )
    elif current_user.is_tailor and appointment.tailor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this appointment",
        )
    
    return appointment


@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: int,
    appointment_update: AppointmentUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Update appointment details."""
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )
    
    # Check permissions
    if current_user.is_customer and appointment.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    # Update fields
    if appointment_update.scheduled_date:
        appointment.scheduled_date = appointment_update.scheduled_date
    if appointment_update.duration_minutes:
        appointment.duration_minutes = appointment_update.duration_minutes
    if appointment_update.customer_notes is not None:
        appointment.customer_notes = appointment_update.customer_notes
    if appointment_update.tailor_notes is not None and (current_user.is_tailor or current_user.is_admin):
        appointment.tailor_notes = appointment_update.tailor_notes
    
    await db.commit()
    await db.refresh(appointment)
    return appointment


@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
async def update_appointment_status(
    appointment_id: int,
    status_update: AppointmentStatusUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Update appointment status (Tailor/Admin only)."""
    if not (current_user.is_tailor or current_user.is_admin or current_user.is_staff):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tailors and admins can update status",
        )
    
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )
    
    appointment.status = status_update.status
    if status_update.notes:
        appointment.tailor_notes = status_update.notes
    
    if status_update.status == AppointmentStatus.COMPLETED:
        appointment.completed_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(appointment)
    return appointment


@router.post("/{appointment_id}/reschedule", response_model=AppointmentResponse)
async def reschedule_appointment(
    appointment_id: int,
    reschedule_data: AppointmentReschedule,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Reschedule an appointment."""
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )
    
    if not appointment.can_reschedule:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Appointment cannot be rescheduled",
        )
    
    # Check permissions
    if current_user.is_customer and appointment.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    # Update appointment
    appointment.scheduled_date = reschedule_data.new_scheduled_date
    appointment.status = AppointmentStatus.RESCHEDULED
    appointment.reschedule_count += 1
    
    await db.commit()
    await db.refresh(appointment)
    return appointment


@router.post("/{appointment_id}/cancel", response_model=MessageResponse)
async def cancel_appointment(
    appointment_id: int,
    cancel_data: AppointmentCancel,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Cancel an appointment."""
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )
    
    if not appointment.can_cancel:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Appointment cannot be cancelled",
        )
    
    # Check permissions
    if current_user.is_customer and appointment.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    # Cancel appointment
    appointment.status = AppointmentStatus.CANCELLED
    appointment.cancellation_reason = cancel_data.cancellation_reason
    appointment.cancelled_at = datetime.utcnow()
    
    await db.commit()
    
    return {"message": "Appointment cancelled successfully"}


@router.get("/availability/slots", response_model=AvailabilityResponse)
async def get_availability(
    tailor_id: int,
    branch_id: int,
    date: datetime,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Get availability slots for a tailor on a specific date.
    """
    # Define working hours (10:00 to 19:00)
    # Determine day of week
    day_name = date.strftime("%A").lower()
    
    # Fetch tailor availability for this branch and day
    availability_query = select(TailorAvailability).where(
        and_(
            TailorAvailability.tailor_id == tailor_id,
            TailorAvailability.branch_id == branch_id,
            TailorAvailability.day_of_week == day_name,
            TailorAvailability.is_active == True
        )
    )
    availability_result = await db.execute(availability_query)
    tailor_availability = availability_result.scalar_one_or_none()
    
    # If no availability record found, assume tailor is off
    if not tailor_availability:
        return AvailabilityResponse(
            date=date,
            branch_id=branch_id,
            available_slots=[]
        )

    # Use configured working hours
    start_time_time = tailor_availability.start_time
    end_time_time = tailor_availability.end_time
    slot_duration = tailor_availability.slot_duration_minutes

    # Combine date with time
    start_time = datetime.combine(date.date(), start_time_time)
    end_time = datetime.combine(date.date(), end_time_time)
    
    # Fetch existing appointments
    query = select(Appointment).where(
        and_(
            Appointment.tailor_id == tailor_id,
            Appointment.scheduled_date >= start_time,
            Appointment.scheduled_date < end_time,
            Appointment.status.in_([
                AppointmentStatus.PENDING,
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.IN_PROGRESS,
            ])
        )
    )
    result = await db.execute(query)
    existing_appointments = result.scalars().all()
    
    # Generate slots
    slots = []
    current_slot = start_time
    while current_slot < end_time:
        slot_end = current_slot + timedelta(minutes=slot_duration)
        
        # Check if slot is taken
        is_available = True
        for appointment in existing_appointments:
            # Check for overlap
            # Appointment starts during slot OR Slot starts during appointment
            app_start = appointment.scheduled_date
            app_end = app_start + timedelta(minutes=appointment.duration_minutes)
            
            if (current_slot < app_end and slot_end > app_start):
                 is_available = False
                 break
        
        # Get tailor name (could be optimized to fetch once)
        tailor_result = await db.execute(select(User).where(User.id == tailor_id))
        tailor = tailor_result.scalar_one_or_none()
        tailor_name = tailor.full_name if tailor else "Unknown Tailor"

        slots.append(AvailabilitySlot(
            start_time=current_slot,
            end_time=slot_end,
            tailor_id=tailor_id,
            tailor_name=tailor_name,
            is_available=is_available
        ))
        
        current_slot = slot_end
        
    return AvailabilityResponse(
        date=date,
        branch_id=branch_id,
        available_slots=slots
    )
