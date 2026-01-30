"""Measurement profile and versioning models."""

from datetime import datetime
from enum import Enum
from sqlalchemy import String, DateTime, Integer, ForeignKey, Float, Text, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class FitPreference(str, Enum):
    """Fit preference enumeration."""
    TIGHT = "tight"
    SLIM = "slim"
    REGULAR = "regular"
    COMFORTABLE = "comfortable"
    LOOSE = "loose"


class MeasurementStatus(str, Enum):
    """Measurement approval status."""
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"


class MeasurementProfile(Base):
    """Customer measurement profile."""
    
    __tablename__ = "measurement_profiles"
    
    # Primary Key
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    # Foreign Keys
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    
    # Profile Information
    profile_name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Current Version
    current_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    
    # Status
    status: Mapped[MeasurementStatus] = mapped_column(
        String(50), 
        default=MeasurementStatus.DRAFT, 
        nullable=False
    )
    
    # Approval
    approved_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    approved_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    rejection_reason: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow, 
        nullable=False
    )
    
    def __repr__(self) -> str:
        return f"<MeasurementProfile(id={self.id}, customer_id={self.customer_id}, name={self.profile_name})>"


class MeasurementVersion(Base):
    """Measurement version history."""
    
    __tablename__ = "measurement_versions"
    
    # Primary Key
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    # Foreign Keys
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("measurement_profiles.id"), 
        nullable=False, 
        index=True
    )
    
    # Version Information
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Body Measurements (in cm)
    # Upper Body
    neck: Mapped[float] = mapped_column(Float, nullable=True)
    shoulder: Mapped[float] = mapped_column(Float, nullable=True)
    chest: Mapped[float] = mapped_column(Float, nullable=True)
    waist: Mapped[float] = mapped_column(Float, nullable=True)
    hip: Mapped[float] = mapped_column(Float, nullable=True)
    
    # Arms
    arm_length: Mapped[float] = mapped_column(Float, nullable=True)
    sleeve_length: Mapped[float] = mapped_column(Float, nullable=True)
    bicep: Mapped[float] = mapped_column(Float, nullable=True)
    wrist: Mapped[float] = mapped_column(Float, nullable=True)
    
    # Legs
    inseam: Mapped[float] = mapped_column(Float, nullable=True)
    outseam: Mapped[float] = mapped_column(Float, nullable=True)
    thigh: Mapped[float] = mapped_column(Float, nullable=True)
    knee: Mapped[float] = mapped_column(Float, nullable=True)
    calf: Mapped[float] = mapped_column(Float, nullable=True)
    ankle: Mapped[float] = mapped_column(Float, nullable=True)
    
    # Torso
    back_length: Mapped[float] = mapped_column(Float, nullable=True)
    front_length: Mapped[float] = mapped_column(Float, nullable=True)
    
    # Additional Measurements (stored as JSON for flexibility)
    additional_measurements: Mapped[dict] = mapped_column(JSON, nullable=True)
    
    # Fit Preferences
    fit_preference: Mapped[FitPreference] = mapped_column(
        String(50), 
        default=FitPreference.REGULAR, 
        nullable=False
    )
    
    # Body Posture Notes
    posture_notes: Mapped[str] = mapped_column(Text, nullable=True)
    special_requirements: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Metadata
    measured_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    measurement_method: Mapped[str] = mapped_column(
        String(50), 
        default="manual", 
        nullable=False
    )  # manual, ai_assisted, image_based
    
    # Change Tracking
    change_notes: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self) -> str:
        return f"<MeasurementVersion(id={self.id}, profile_id={self.profile_id}, version={self.version_number})>"
