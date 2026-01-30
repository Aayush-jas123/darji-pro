"""Appointment booking models."""

from datetime import datetime
from enum import Enum
from sqlalchemy import String, Boolean, DateTime, Integer, ForeignKey, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AppointmentStatus(str, Enum):
    """Appointment status enumeration."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    RESCHEDULED = "rescheduled"
    NO_SHOW = "no_show"


class AppointmentType(str, Enum):
    """Appointment type enumeration."""
    MEASUREMENT = "measurement"
    FITTING = "fitting"
    DELIVERY = "delivery"
    CONSULTATION = "consultation"
    ALTERATION = "alteration"


class Appointment(Base):
    """Appointment booking model."""
    
    __tablename__ = "appointments"
    
    # Primary Key
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    # Foreign Keys
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    tailor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), nullable=False, index=True)
    
    # Appointment Details
    appointment_type: Mapped[AppointmentType] = mapped_column(String(50), nullable=False)
    status: Mapped[AppointmentStatus] = mapped_column(
        String(50), 
        default=AppointmentStatus.PENDING, 
        nullable=False,
        index=True
    )
    
    # Scheduling
    scheduled_date: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    
    # Priority & Rush
    is_priority: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_rush: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    rush_fee: Mapped[float] = mapped_column(Float, default=0.0, nullable=True)
    
    # Notes
    customer_notes: Mapped[str] = mapped_column(Text, nullable=True)
    tailor_notes: Mapped[str] = mapped_column(Text, nullable=True)
    cancellation_reason: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Notification Status
    confirmation_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    reminder_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Rescheduling
    original_appointment_id: Mapped[int] = mapped_column(
        ForeignKey("appointments.id"), 
        nullable=True
    )
    reschedule_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow, 
        nullable=False
    )
    cancelled_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    def __repr__(self) -> str:
        return f"<Appointment(id={self.id}, customer_id={self.customer_id}, status={self.status})>"
    
    @property
    def is_active(self) -> bool:
        """Check if appointment is active (not cancelled or completed)."""
        return self.status not in [
            AppointmentStatus.CANCELLED,
            AppointmentStatus.COMPLETED,
            AppointmentStatus.NO_SHOW
        ]
    
    @property
    def can_reschedule(self) -> bool:
        """Check if appointment can be rescheduled."""
        return self.status in [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]
    
    @property
    def can_cancel(self) -> bool:
        """Check if appointment can be cancelled."""
        return self.status in [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]
