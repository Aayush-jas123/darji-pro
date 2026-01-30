"""Schemas package - Pydantic models for request/response validation."""

from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserListResponse,
    Token,
    LoginRequest,
    RegisterRequest,
    PasswordResetRequest,
    PasswordResetConfirm,
)
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    AppointmentListResponse,
    AvailabilityResponse,
)
from app.schemas.measurement import (
    MeasurementProfileCreate,
    MeasurementProfileUpdate,
    MeasurementProfileResponse,
    MeasurementVersionResponse,
)
from app.schemas.branch import (
    BranchCreate,
    BranchUpdate,
    BranchResponse,
    TailorAvailabilityCreate,
    TailorAvailabilityResponse,
)
from app.schemas.common import (
    PaginationParams,
    PaginatedResponse,
    MessageResponse,
    ErrorResponse,
    SuccessResponse,
)

__all__ = [
    # User
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserListResponse",
    "Token",
    "LoginRequest",
    "RegisterRequest",
    "PasswordResetRequest",
    "PasswordResetConfirm",
    # Appointment
    "AppointmentCreate",
    "AppointmentUpdate",
    "AppointmentResponse",
    "AppointmentListResponse",
    "AvailabilityResponse",
    # Measurement
    "MeasurementProfileCreate",
    "MeasurementProfileUpdate",
    "MeasurementProfileResponse",
    "MeasurementVersionResponse",
    # Branch
    "BranchCreate",
    "BranchUpdate",
    "BranchResponse",
    "TailorAvailabilityCreate",
    "TailorAvailabilityResponse",
    # Common
    "PaginationParams",
    "PaginatedResponse",
    "MessageResponse",
    "ErrorResponse",
    "SuccessResponse",
]
