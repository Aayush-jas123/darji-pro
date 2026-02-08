"""System models for audit logs and notifications."""

from datetime import datetime
from enum import Enum
from sqlalchemy import String, DateTime, Integer, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AuditAction(str, Enum):
    """Audit action types."""
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    APPROVE = "approve"
    REJECT = "reject"
    CANCEL = "cancel"


class NotificationChannel(str, Enum):
    """Notification delivery channels."""
    EMAIL = "email"
    SMS = "sms"
    WHATSAPP = "whatsapp"
    IN_APP = "in_app"


class NotificationStatus(str, Enum):
    """Notification delivery status."""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    BOUNCED = "bounced"


class AuditLog(Base):
    """Audit log for tracking all system actions."""
    
    __tablename__ = "audit_logs"
    
    # Primary Key
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    # User Information
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    user_email: Mapped[str] = mapped_column(String(255), nullable=True)
    
    # Action Details
    action: Mapped[AuditAction] = mapped_column(String(50), nullable=False, index=True)
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_id: Mapped[int] = mapped_column(Integer, nullable=True)
    
    # Request Information
    ip_address: Mapped[str] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Change Details
    changes: Mapped[dict] = mapped_column(JSON, nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        nullable=False,
        index=True
    )
    
    def __repr__(self) -> str:
        return f"<AuditLog(id={self.id}, action={self.action}, resource={self.resource_type})>"


class Notification(Base):
    """Notification tracking for multi-channel delivery."""
    
    __tablename__ = "notifications"
    
    # Primary Key
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    # Recipient
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    
    # Notification Details
    channel: Mapped[NotificationChannel] = mapped_column(String(50), nullable=False)
    status: Mapped[NotificationStatus] = mapped_column(
        String(50), 
        default=NotificationStatus.PENDING, 
        nullable=False,
        index=True
    )
    
    # Content
    subject: Mapped[str] = mapped_column(String(500), nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    template_name: Mapped[str] = mapped_column(String(100), nullable=True)
    template_data: Mapped[dict] = mapped_column(JSON, nullable=True)
    
    # Delivery Information
    recipient_address: Mapped[str] = mapped_column(String(255), nullable=False)  # email/phone
    
    # Related Resource
    related_resource_type: Mapped[str] = mapped_column(String(100), nullable=True)
    related_resource_id: Mapped[int] = mapped_column(Integer, nullable=True)
    
    # Delivery Tracking
    sent_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    delivered_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    failed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    error_message: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Retry Logic
    retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_retries: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    next_retry_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow, 
        nullable=False
    )
    
    def __repr__(self) -> str:
        return f"<Notification(id={self.id}, channel={self.channel}, status={self.status})>"
    
    @property
    def can_retry(self) -> bool:
        """Check if notification can be retried."""
        return (
            self.status == NotificationStatus.FAILED 
            and self.retry_count < self.max_retries
        )

    # Relationships
    user = relationship("User", back_populates="notifications")
