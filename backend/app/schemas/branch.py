"""Branch-related Pydantic schemas."""

from datetime import time
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.models.branch import DayOfWeek


class BranchBase(BaseModel):
    """Base schema for branch."""
    name: str = Field(..., min_length=1, max_length=255)
    code: str = Field(..., min_length=1, max_length=50)
    address: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    pincode: str = Field(..., min_length=1, max_length=10)
    phone: str = Field(..., min_length=1, max_length=20)
    email: Optional[EmailStr] = None


class BranchCreate(BranchBase):
    """Schema for creating a branch."""
    pass


class BranchUpdate(BaseModel):
    """Schema for updating a branch."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    pincode: Optional[str] = Field(None, max_length=10)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None


class BranchResponse(BranchBase):
    """Schema for branch response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    is_active: bool


class TailorAvailabilityBase(BaseModel):
    """Base schema for tailor availability."""
    day_of_week: DayOfWeek
    start_time: time
    end_time: time
    slot_duration_minutes: int = Field(default=30, ge=15, le=120)
    buffer_time_minutes: int = Field(default=10, ge=0, le=60)
    max_appointments_per_day: Optional[int] = Field(None, ge=1, le=50)


class TailorAvailabilityCreate(TailorAvailabilityBase):
    """Schema for creating tailor availability."""
    tailor_id: int
    branch_id: int


class TailorAvailabilityUpdate(BaseModel):
    """Schema for updating tailor availability."""
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    slot_duration_minutes: Optional[int] = Field(None, ge=15, le=120)
    buffer_time_minutes: Optional[int] = Field(None, ge=0, le=60)
    max_appointments_per_day: Optional[int] = Field(None, ge=1, le=50)
    is_active: Optional[bool] = None


class TailorAvailabilityResponse(TailorAvailabilityBase):
    """Schema for tailor availability response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    tailor_id: int
    branch_id: int
    is_active: bool


class AvailabilitySetting(BaseModel):
    """Schema for simplified availability setting."""
    day_of_week: DayOfWeek
    start_time: time
    end_time: time
    is_active: bool = True
