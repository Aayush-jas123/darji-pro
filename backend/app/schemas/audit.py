"""Audit log schemas for request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AuditLogBase(BaseModel):
    """Base audit log schema."""
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[int] = None
    details: Optional[dict] = None


class AuditLogCreate(AuditLogBase):
    """Schema for creating an audit log entry."""
    user_id: Optional[int] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class AuditLogResponse(AuditLogBase):
    """Schema for audit log response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: Optional[int] = None
    ip_address: Optional[str] = None
    created_at: datetime
    
    # Optional user info
    user_email: Optional[str] = None
    user_name: Optional[str] = None


class AuditLogListResponse(BaseModel):
    """Schema for paginated audit log list."""
    total: int
    page: int
    page_size: int
    logs: list[AuditLogResponse]
