"""Order model for tracking garment production."""

from datetime import datetime
from enum import Enum
from sqlalchemy import String, Integer, ForeignKey, DateTime, Enum as SQLEnum, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class OrderStatus(str, Enum):
    """Order status enumeration."""
    PENDING = "pending"
    CUTTING = "cutting"
    STITCHING = "stitching"
    FINISHING = "finishing"
    QUALITY_CHECK = "quality_check"
    READY = "ready"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Order(Base):
    """Order model for tracking garment production."""
    
    __tablename__ = "orders"
    
    # Primary Key
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    # Foreign Keys
    appointment_id: Mapped[int] = mapped_column(ForeignKey("appointments.id", ondelete="CASCADE"), nullable=False)
    customer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    tailor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    
    # Order Details
    order_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    garment_type: Mapped[str] = mapped_column(String(100), nullable=False)
    fabric_details: Mapped[str] = mapped_column(Text, nullable=True)
    design_notes: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Status
    status: Mapped[OrderStatus] = mapped_column(String(50), nullable=False, default=OrderStatus.PENDING, index=True)
    
    # Pricing
    estimated_price: Mapped[float] = mapped_column(Float, nullable=True)
    final_price: Mapped[float] = mapped_column(Float, nullable=True)
    
    # Timeline
    estimated_delivery: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    actual_delivery: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )
    
    def __repr__(self) -> str:
        return f"<Order(id={self.id}, order_number={self.order_number}, status={self.status})>"
