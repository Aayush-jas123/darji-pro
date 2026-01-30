"""Branch and tailor availability models."""

from datetime import datetime, time
from enum import Enum
from sqlalchemy import String, Boolean, DateTime, Time, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class DayOfWeek(str, Enum):
    """Days of the week."""
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"


class Branch(Base):
    """Tailoring branch/location model."""
    
    __tablename__ = "branches"
    
    # Primary Key
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    # Branch Information
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    
    # Location
    address: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    pincode: Mapped[str] = mapped_column(String(10), nullable=False)
    
    # Contact
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=True)
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow, 
        nullable=False
    )
    
    # Relationships
    # tailors: Mapped[list["TailorAvailability"]] = relationship(back_populates="branch")
    # appointments: Mapped[list["Appointment"]] = relationship(back_populates="branch")
    
    def __repr__(self) -> str:
        return f"<Branch(id={self.id}, name={self.name}, code={self.code})>"


class TailorAvailability(Base):
    """Tailor availability and working hours."""
    
    __tablename__ = "tailor_availability"
    
    # Primary Key
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    # Foreign Keys
    tailor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branches.id"), nullable=False)
    
    # Working Hours
    day_of_week: Mapped[DayOfWeek] = mapped_column(String(20), nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    
    # Appointment Settings
    slot_duration_minutes: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    buffer_time_minutes: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    max_appointments_per_day: Mapped[int] = mapped_column(Integer, default=16, nullable=True)
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow, 
        nullable=False
    )
    
    def __repr__(self) -> str:
        return f"<TailorAvailability(tailor_id={self.tailor_id}, branch_id={self.branch_id}, day={self.day_of_week})>"
