"""Branch management API routes."""

from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User
from app.models.branch import Branch, TailorAvailability
from app.schemas.branch import (
    BranchCreate,
    BranchUpdate,
    BranchResponse,
    TailorAvailabilityCreate,
    TailorAvailabilityUpdate,
    TailorAvailabilityResponse,
)
from app.schemas.common import MessageResponse

router = APIRouter()


@router.get("", response_model=list[BranchResponse])
async def list_branches(
    db: Annotated[AsyncSession, Depends(get_db)],
    is_active: Optional[bool] = None,
):
    """List all branches."""
    query = select(Branch)
    
    if is_active is not None:
        query = query.where(Branch.is_active == is_active)
    
    query = query.order_by(Branch.name)
    
    result = await db.execute(query)
    branches = result.scalars().all()
    
    return branches


@router.post("", response_model=BranchResponse, status_code=status.HTTP_201_CREATED)
async def create_branch(
    branch_data: BranchCreate,
    current_user: Annotated[User, Depends(require_role(["admin"]))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Create a new branch (Admin only)."""
    # Check if code already exists
    result = await db.execute(select(Branch).where(Branch.code == branch_data.code))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Branch code already exists",
        )
    
    new_branch = Branch(**branch_data.model_dump())
    
    db.add(new_branch)
    await db.commit()
    await db.refresh(new_branch)
    
    return new_branch


@router.get("/{branch_id}", response_model=BranchResponse)
async def get_branch(
    branch_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get branch by ID."""
    result = await db.execute(select(Branch).where(Branch.id == branch_id))
    branch = result.scalar_one_or_none()
    
    if not branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Branch not found",
        )
    
    return branch


@router.put("/{branch_id}", response_model=BranchResponse)
async def update_branch(
    branch_id: int,
    branch_update: BranchUpdate,
    current_user: Annotated[User, Depends(require_role(["admin"]))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Update branch (Admin only)."""
    result = await db.execute(select(Branch).where(Branch.id == branch_id))
    branch = result.scalar_one_or_none()
    
    if not branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Branch not found",
        )
    
    # Update fields
    update_data = branch_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(branch, field, value)
    
    await db.commit()
    await db.refresh(branch)
    
    return branch


@router.delete("/{branch_id}", response_model=MessageResponse)
async def delete_branch(
    branch_id: int,
    current_user: Annotated[User, Depends(require_role(["admin"]))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Delete branch (Admin only)."""
    result = await db.execute(select(Branch).where(Branch.id == branch_id))
    branch = result.scalar_one_or_none()
    
    if not branch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Branch not found",
        )
    
    await db.delete(branch)
    await db.commit()
    
    return {"message": f"Branch {branch.name} deleted successfully"}


# Tailor Availability Routes
@router.get("/{branch_id}/availability", response_model=list[TailorAvailabilityResponse])
async def list_tailor_availability(
    branch_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    tailor_id: Optional[int] = None,
):
    """List tailor availability for a branch."""
    query = select(TailorAvailability).where(TailorAvailability.branch_id == branch_id)
    
    if tailor_id:
        query = query.where(TailorAvailability.tailor_id == tailor_id)
    
    result = await db.execute(query)
    availability = result.scalars().all()
    
    return availability


@router.post("/availability", response_model=TailorAvailabilityResponse, status_code=status.HTTP_201_CREATED)
async def create_tailor_availability(
    availability_data: TailorAvailabilityCreate,
    current_user: Annotated[User, Depends(require_role(["admin", "staff"]))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Create tailor availability (Admin/Staff only)."""
    new_availability = TailorAvailability(**availability_data.model_dump())
    
    db.add(new_availability)
    await db.commit()
    await db.refresh(new_availability)
    
    return new_availability


@router.put("/availability/{availability_id}", response_model=TailorAvailabilityResponse)
async def update_tailor_availability(
    availability_id: int,
    availability_update: TailorAvailabilityUpdate,
    current_user: Annotated[User, Depends(require_role(["admin", "staff"]))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Update tailor availability (Admin/Staff only)."""
    result = await db.execute(
        select(TailorAvailability).where(TailorAvailability.id == availability_id)
    )
    availability = result.scalar_one_or_none()
    
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability record not found",
        )
    
    # Update fields
    update_data = availability_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(availability, field, value)
    
    await db.commit()
    await db.refresh(availability)
    
    return availability
