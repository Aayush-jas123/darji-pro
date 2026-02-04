"""Notification Pydantic schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class NotificationBase(BaseModel):
    """Base notification schema."""
    channel: str = Field(..., description="Notification channel: email, sms, in_app")
    subject: Optional[str] = Field(None, max_length=500)
    message: str = Field(..., description="Notification message content")
    related_resource_type: Optional[str] = Field(None, max_length=100)
    related_resource_id: Optional[int] = None


class NotificationCreate(NotificationBase):
    """Schema for creating a notification."""
    user_id: int
    recipient_address: str = Field(..., description="Email address or phone number")
    template_name: Optional[str] = None
    template_data: Optional[dict] = None


class NotificationUpdate(BaseModel):
    """Schema for updating a notification."""
    status: Optional[str] = None
    error_message: Optional[str] = None


class NotificationResponse(NotificationBase):
    """Schema for notification response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    status: str
    recipient_address: str
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    failed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    retry_count: int
    created_at: datetime
    updated_at: datetime


class NotificationStats(BaseModel):
    """Statistics about notifications."""
    total: int
    unread: int
    email: int
    in_app: int
    sms: int
