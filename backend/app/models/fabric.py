"""Fabric model for global catalog."""

from datetime import datetime
from sqlalchemy import String, Float, Boolean, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Fabric(Base):
    """Fabric model for global catalog."""
    
    __tablename__ = "fabrics"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False, index=True) # Cotton, Silk, etc.
    color: Mapped[str] = mapped_column(String(50), nullable=True, index=True) # Red, Blue, etc.
    pattern: Mapped[str] = mapped_column(String(50), nullable=True) # Solid, Striped, Checked, etc.
    price_per_meter: Mapped[float] = mapped_column(Float, nullable=False)
    image_url: Mapped[str] = mapped_column(String, nullable=True) # URL or path
    description: Mapped[str] = mapped_column(Text, nullable=True)
    in_stock: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow, 
        nullable=False
    )
    
    def __repr__(self):
        return f"<Fabric {self.name}>"
