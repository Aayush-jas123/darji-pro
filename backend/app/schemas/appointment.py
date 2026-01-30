"""Appointment-related Pydantic schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

from app.models.appointment import AppointmentStatus, AppointmentType


class AppointmentBase(BaseModel):
    """Base appointment schema."""
    appointment_type: AppointmentType
    scheduled_date: datetime
    duration_minutes: int = Field(default=30, ge=15, le=240)
    customer_notes: Optional[str] = Field(None, max_length=1000)


class AppointmentCreate(AppointmentBase):
    """Schema for creating an appointment."""
    tailor_id: int
    branch_id: int
    is_priority: bool = False
    is_rush: bool = False


class AppointmentUpdate(BaseModel):
    """Schema for updating an appointment."""
    scheduled_date: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=15, le=240)
    customer_notes: Optional[str] = Field(None, max_length=1000)
    tailor_notes: Optional[str] = Field(None, max_length=1000)


class AppointmentStatusUpdate(BaseModel):
    """Schema for updating appointment status."""
    status: AppointmentStatus
    notes: Optional[str] = None


class AppointmentReschedule(BaseModel):
    """Schema for rescheduling an appointment."""
    new_scheduled_date: datetime
    reason: Optional[str] = Field(None, max_length=500)


class AppointmentCancel(BaseModel):
    """Schema for cancelling an appointment."""
    cancellation_reason: str = Field(..., min_length=1, max_length=500)


class AppointmentResponse(AppointmentBase):
    """Schema for appointment response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    customer_id: int
    tailor_id: int
    branch_id: int
    status: AppointmentStatus
    is_priority: bool
    is_rush: bool
    rush_fee: Optional[float] = None
    tailor_notes: Optional[str] = None
    confirmation_sent: bool
    reminder_sent: bool
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None


class AppointmentListResponse(BaseModel):
    """Schema for paginated appointment list."""
    total: int
    page: int
    page_size: int
    appointments: list[AppointmentResponse]


class AvailabilitySlot(BaseModel):
    """Schema for available time slot."""
    start_time: datetime
    end_time: datetime
    tailor_id: int
    tailor_name: str
    is_available: bool


class AvailabilityResponse(BaseModel):
    """Schema for availability check response."""
    date: datetime
    branch_id: int
    available_slots: list[AvailabilitySlot]
