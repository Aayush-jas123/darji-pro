"""Audit logging utility functions."""

from typing import Optional
from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import AuditLog
from app.models.user import User


async def create_audit_log(
    db: AsyncSession,
    action: str,
    user: Optional[User] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[int] = None,
    details: Optional[dict] = None,
    request: Optional[Request] = None,
):
    """
    Create an audit log entry.
    
    Args:
        db: Database session
        action: Action performed (e.g., "user.login", "order.created")
        user: User who performed the action
        resource_type: Type of resource affected (e.g., "order", "user")
        resource_id: ID of the resource affected
        details: Additional details as JSON
        request: FastAPI request object for IP and user agent
    """
    ip_address = None
    user_agent = None
    
    if request:
        # Get IP address
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            ip_address = forwarded_for.split(",")[0].strip()
        else:
            ip_address = request.client.host if request.client else None
        
        # Get user agent
        user_agent = request.headers.get("User-Agent")
    
    audit_log = AuditLog(
        user_id=user.id if user else None,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    
    db.add(audit_log)
    await db.commit()
    
    return audit_log


# Common audit actions
class AuditAction:
    """Common audit action constants."""
    
    # Authentication
    USER_LOGIN = "user.login"
    USER_LOGOUT = "user.logout"
    USER_REGISTER = "user.register"
    
    # User management
    USER_CREATED = "user.created"
    USER_UPDATED = "user.updated"
    USER_DELETED = "user.deleted"
    PASSWORD_CHANGED = "user.password_changed"
    ROLE_CHANGED = "user.role_changed"
    
    # Orders
    ORDER_CREATED = "order.created"
    ORDER_UPDATED = "order.updated"
    ORDER_STATUS_CHANGED = "order.status_changed"
    ORDER_DELETED = "order.deleted"
    
    # Measurements
    MEASUREMENT_CREATED = "measurement.created"
    MEASUREMENT_UPDATED = "measurement.updated"
    MEASUREMENT_APPROVED = "measurement.approved"
    MEASUREMENT_REJECTED = "measurement.rejected"
    
    # Appointments
    APPOINTMENT_CREATED = "appointment.created"
    APPOINTMENT_UPDATED = "appointment.updated"
    APPOINTMENT_CANCELLED = "appointment.cancelled"
    
    # Data exports
    DATA_EXPORTED = "data.exported"
