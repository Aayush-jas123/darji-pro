"""User-related Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Optional, Union
from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.models.user import UserRole


# Base schemas
class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(..., min_length=8, max_length=100)
    role: UserRole = UserRole.CUSTOMER


class UserUpdate(BaseModel):
    """Schema for updating user information."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None


class UserPasswordUpdate(BaseModel):
    """Schema for updating user password."""
    current_password: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8, max_length=100)


class UserResponse(UserBase):
    """Schema for user response."""
    # Config for ORM mode
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    role: Union[UserRole, str]
    is_active: bool
    is_verified: bool
    is_priority: bool
    created_at: datetime
    last_login: Optional[datetime] = None


class UserListResponse(BaseModel):
    """Schema for paginated user list response."""
    total: int
    page: int
    page_size: int
    users: list[UserResponse]


# Authentication schemas
class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for token payload data."""
    user_id: Optional[int] = None
    email: Optional[str] = None


class LoginRequest(BaseModel):
    """Schema for login request."""
    email: EmailStr
    password: str


class RegisterRequest(UserCreate):
    """Schema for user registration."""
    pass


class PasswordResetRequest(BaseModel):
    """Schema for password reset request."""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Schema for password reset confirmation."""
    token: str
    new_password: str = Field(..., min_length=8, max_length=100)


class EmailVerificationRequest(BaseModel):
    """Schema for email verification."""
    token: str
