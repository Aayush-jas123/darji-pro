"""Fabric Pydantic schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class FabricBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: str = Field(..., min_length=1, max_length=50)
    color: Optional[str] = Field(None, max_length=50)
    pattern: Optional[str] = Field(None, max_length=50)
    price_per_meter: float = Field(..., gt=0)
    image_url: Optional[str] = None
    description: Optional[str] = None
    in_stock: bool = True

class FabricCreate(FabricBase):
    pass

class FabricUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[str] = Field(None, min_length=1, max_length=50)
    color: Optional[str] = Field(None, max_length=50)
    pattern: Optional[str] = Field(None, max_length=50)
    price_per_meter: Optional[float] = Field(None, gt=0)
    image_url: Optional[str] = None
    description: Optional[str] = None
    in_stock: Optional[bool] = None

class FabricResponse(FabricBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: datetime

