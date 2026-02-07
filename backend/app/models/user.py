"""User models for customers, tailors, and admins."""

from datetime import datetime
from enum import Enum
from sqlalchemy import String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserRole(str, Enum):
    """User role enumeration."""
    CUSTOMER = "customer"
    TAILOR = "tailor"
    ADMIN = "admin"
    STAFF = "staff"


class User(Base):
    """Base user model for all user types."""
    
    __tablename__ = "users"
    
    # Primary Key
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    # Authentication
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Profile Information
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="customer")
    
    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_priority: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)  # For VIP customers
    
    # Account Status (for approval workflow)
    account_status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)  # active, pending, rejected, suspended
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    email_verification_token: Mapped[str] = mapped_column(String(255), nullable=True)
    email_verification_sent_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    # Approval tracking (for tailors)
    approval_notes: Mapped[str] = mapped_column(String, nullable=True)
    approved_by_id: Mapped[int] = mapped_column(nullable=True)
    approved_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    # Tailor-specific fields
    experience_years: Mapped[int] = mapped_column(nullable=True)
    specialization: Mapped[str] = mapped_column(String(500), nullable=True)
    bio: Mapped[str] = mapped_column(String, nullable=True)
    
    # OAuth
    google_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=True)
    facebook_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow, 
        nullable=False
    )
    last_login: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    # Relationships (will be defined in other models)
    # appointments: Mapped[list["Appointment"]] = relationship(back_populates="customer")
    # measurements: Mapped[list["MeasurementProfile"]] = relationship(back_populates="customer")
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
    
    @property
    def is_customer(self) -> bool:
        """Check if user is a customer."""
        return self.role == UserRole.CUSTOMER
    
    @property
    def is_tailor(self) -> bool:
        """Check if user is a tailor."""
        return self.role == UserRole.TAILOR
    
    @property
    def is_admin(self) -> bool:
        """Check if user is an admin."""
        return self.role == UserRole.ADMIN
    
    @property
    def is_staff(self) -> bool:
        """Check if user is staff."""
        return self.role == UserRole.STAFF
