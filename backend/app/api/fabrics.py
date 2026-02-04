"""Fabric API routes."""

from typing import Annotated, Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_role, get_current_user_optional
from app.models.user import UserRole, User
from app.models.fabric import Fabric
from app.schemas.fabric import FabricCreate, FabricResponse, FabricUpdate

router = APIRouter()

@router.get("/", response_model=List[FabricResponse])
async def list_fabrics(
    db: Annotated[AsyncSession, Depends(get_db)],
    type: Optional[str] = None,
    color: Optional[str] = None,
    pattern: Optional[str] = None,
    search: Optional[str] = None,
    in_stock: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """
    List all fabrics with filtering and search. Public endpoint.
    
    Filters:
    - type: Filter by fabric type (Cotton, Silk, etc.)
    - color: Filter by color
    - pattern: Filter by pattern (Solid, Striped, etc.)
    - search: Search in name and description
    - in_stock: Filter by stock availability
    """
    query = select(Fabric)
    
    if type:
        query = query.where(Fabric.type == type)
    if color:
        query = query.where(Fabric.color == color)
    if pattern:
        query = query.where(Fabric.pattern == pattern)
    if in_stock is not None:
        query = query.where(Fabric.in_stock == in_stock)
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            (Fabric.name.ilike(search_pattern)) | 
            (Fabric.description.ilike(search_pattern))
        )
        
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()



@router.post("/", response_model=FabricResponse, status_code=status.HTTP_201_CREATED)
async def create_fabric(
    fabric_data: FabricCreate,
    current_user: Annotated[User, Depends(require_role([UserRole.ADMIN.value, UserRole.TAILOR.value]))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Create a new fabric. Admin or Tailor only.
    """
    new_fabric = Fabric(**fabric_data.model_dump())
    db.add(new_fabric)
    await db.commit()
    await db.refresh(new_fabric)
    return new_fabric


@router.put("/{fabric_id}", response_model=FabricResponse)
async def update_fabric(
    fabric_id: int,
    fabric_update: FabricUpdate,
    current_user: Annotated[User, Depends(require_role([UserRole.ADMIN.value, UserRole.TAILOR.value]))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Update a fabric. Admin or Tailor only.
    """
    result = await db.execute(select(Fabric).where(Fabric.id == fabric_id))
    fabric = result.scalar_one_or_none()
    
    if not fabric:
        raise HTTPException(status_code=404, detail="Fabric not found")
        
    update_data = fabric_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(fabric, field, value)
        
    await db.commit()
    await db.refresh(fabric)
    return fabric


@router.delete("/{fabric_id}")
async def delete_fabric(
    fabric_id: int,
    current_user: Annotated[User, Depends(require_role([UserRole.ADMIN.value]))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Delete a fabric. Admin only.
    """
    result = await db.execute(select(Fabric).where(Fabric.id == fabric_id))
    fabric = result.scalar_one_or_none()
    
    if not fabric:
        raise HTTPException(status_code=404, detail="Fabric not found")
        
    await db.delete(fabric)
    await db.commit()
    return {"message": "Fabric deleted successfully"}
