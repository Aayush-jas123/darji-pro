"""Measurement-related Pydantic schemas."""

from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

from app.models.measurement import FitPreference, MeasurementStatus


class MeasurementVersionBase(BaseModel):
    """Base schema for measurement version."""
    # Upper Body
    neck: Optional[float] = Field(None, ge=0, le=100)
    shoulder: Optional[float] = Field(None, ge=0, le=100)
    chest: Optional[float] = Field(None, ge=0, le=200)
    waist: Optional[float] = Field(None, ge=0, le=200)
    hip: Optional[float] = Field(None, ge=0, le=200)
    
    # Arms
    arm_length: Optional[float] = Field(None, ge=0, le=150)
    sleeve_length: Optional[float] = Field(None, ge=0, le=150)
    bicep: Optional[float] = Field(None, ge=0, le=100)
    wrist: Optional[float] = Field(None, ge=0, le=50)
    
    # Legs
    inseam: Optional[float] = Field(None, ge=0, le=150)
    outseam: Optional[float] = Field(None, ge=0, le=200)
    thigh: Optional[float] = Field(None, ge=0, le=150)
    knee: Optional[float] = Field(None, ge=0, le=100)
    calf: Optional[float] = Field(None, ge=0, le=100)
    ankle: Optional[float] = Field(None, ge=0, le=50)
    
    # Torso
    back_length: Optional[float] = Field(None, ge=0, le=150)
    front_length: Optional[float] = Field(None, ge=0, le=150)
    
    # Additional
    additional_measurements: Optional[Dict[str, Any]] = None
    
    # Preferences
    fit_preference: FitPreference = FitPreference.REGULAR
    posture_notes: Optional[str] = Field(None, max_length=1000)
    special_requirements: Optional[str] = Field(None, max_length=1000)


class MeasurementVersionCreate(MeasurementVersionBase):
    """Schema for creating a measurement version."""
    change_notes: Optional[str] = Field(None, max_length=500)


class MeasurementVersionResponse(MeasurementVersionBase):
    """Schema for measurement version response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    profile_id: int
    version_number: int
    measured_by_id: Optional[int] = None
    measurement_method: str
    created_at: datetime


class MeasurementProfileBase(BaseModel):
    """Base schema for measurement profile."""
    profile_name: str = Field(..., min_length=1, max_length=255)
    is_default: bool = False


class MeasurementProfileCreate(MeasurementProfileBase):
    """Schema for creating a measurement profile."""
    measurements: MeasurementVersionCreate


class MeasurementProfileUpdate(BaseModel):
    """Schema for updating a measurement profile."""
    profile_name: Optional[str] = Field(None, min_length=1, max_length=255)
    is_default: Optional[bool] = None


class MeasurementProfileResponse(MeasurementProfileBase):
    """Schema for measurement profile response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    customer_id: int
    current_version: int
    status: MeasurementStatus
    approved_by_id: Optional[int] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class MeasurementProfileWithVersionResponse(MeasurementProfileResponse):
    """Schema for profile with current version."""
    current_measurements: Optional[MeasurementVersionResponse] = None


class MeasurementApproval(BaseModel):
    """Schema for approving/rejecting measurements."""
    approved: bool
    notes: Optional[str] = Field(None, max_length=500)


class MeasurementComparisonResponse(BaseModel):
    """Schema for comparing two measurement versions."""
    profile_id: int
    version_1: MeasurementVersionResponse
    version_2: MeasurementVersionResponse
    differences: Dict[str, Dict[str, float]]  # field_name -> {old, new, diff}
