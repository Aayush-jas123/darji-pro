"""Tailor registration and approval endpoints."""

from typing import Annotated, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.schemas.user import TailorRegistrationRequest, UserResponse
from app.schemas.common import MessageResponse

router = APIRouter()


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def register_tailor(
    tailor_data: TailorRegistrationRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    request: Request,
):
    """
    Register a new tailor account (requires admin approval).
    
    Creates account with 'pending' status. Tailor cannot log in until approved by admin.
    """
    from app.core.audit import create_audit_log
    
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == tailor_data.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Check if phone already exists
    if tailor_data.phone:
        result = await db.execute(select(User).where(User.phone == tailor_data.phone))
        existing_phone = result.scalar_one_or_none()
        
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered",
            )
    
    # Create new tailor with pending status
    new_tailor = User(
        email=tailor_data.email,
        phone=tailor_data.phone,
        full_name=tailor_data.full_name,
        hashed_password=get_password_hash(tailor_data.password),
        role=UserRole.TAILOR.value,
        account_status="pending",  # Requires admin approval
        experience_years=tailor_data.experience_years,
        specialization=tailor_data.specialization,
        bio=tailor_data.bio,
    )
    
    db.add(new_tailor)
    await db.commit()
    await db.refresh(new_tailor)
    
    # Log tailor registration
    await create_audit_log(
        db=db,
        action="tailor.registered",
        user=new_tailor,
        resource_type="user",
        resource_id=new_tailor.id,
        details={
            "role": "tailor",
            "experience_years": tailor_data.experience_years,
            "specialization": tailor_data.specialization,
        },
        request=request,
    )
    
    return MessageResponse(
        message="Application submitted successfully! Your account is pending approval. You'll be notified once an admin reviews your application."
    )


# Approval request schema
class ApprovalRequest(BaseModel):
    """Schema for approving/rejecting tailor applications."""
    notes: Optional[str] = None


@router.get("/applications", response_model=list[UserResponse])
async def list_tailor_applications(
    current_user: Annotated[User, Depends(require_role([UserRole.ADMIN.value]))],
    db: Annotated[AsyncSession, Depends(get_db)],
    status_filter: Optional[str] = None,
):
    """
    List tailor applications (admin only).
    
    Filter by status: pending, approved (active), rejected
    """
    query = select(User).where(User.role == UserRole.TAILOR.value)
    
    if status_filter:
        if status_filter == "approved":
            query = query.where(User.account_status == "active")
        else:
            query = query.where(User.account_status == status_filter)
    else:
        # Default: show pending applications
        query = query.where(User.account_status == "pending")
    
    query = query.order_by(User.created_at.desc())
    
    result = await db.execute(query)
    applications = result.scalars().all()
    
    return applications


@router.get("/applications/{user_id}", response_model=UserResponse)
async def get_tailor_application(
    user_id: int,
    current_user: Annotated[User, Depends(require_role([UserRole.ADMIN.value]))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get specific tailor application details (admin only)."""
    result = await db.execute(
        select(User).where(
            and_(
                User.id == user_id,
                User.role == UserRole.TAILOR.value
            )
        )
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )
    
    return application


@router.post("/applications/{user_id}/approve", response_model=MessageResponse)
async def approve_tailor_application(
    user_id: int,
    approval_data: ApprovalRequest,
    current_user: Annotated[User, Depends(require_role([UserRole.ADMIN.value]))],
    db: Annotated[AsyncSession, Depends(get_db)],
    request: Request,
):
    """Approve tailor application (admin only)."""
    from app.core.audit import create_audit_log
    
    # Get tailor application
    result = await db.execute(
        select(User).where(
            and_(
                User.id == user_id,
                User.role == UserRole.TAILOR.value,
                User.account_status == "pending"
            )
        )
    )
    tailor = result.scalar_one_or_none()
    
    if not tailor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pending application not found",
        )
    
    # Approve application
    tailor.account_status = "active"
    tailor.approved_by_id = current_user.id
    tailor.approved_at = datetime.utcnow()
    tailor.approval_notes = approval_data.notes
    
    await db.commit()
    await db.refresh(tailor)
    
    # Log approval
    await create_audit_log(
        db=db,
        action="tailor.approved",
        user=current_user,
        resource_type="user",
        resource_id=tailor.id,
        details={
            "tailor_name": tailor.full_name,
            "tailor_email": tailor.email,
            "notes": approval_data.notes,
        },
        request=request,
    )
    
    # TODO: Send approval notification email to tailor
    
    return MessageResponse(
        message=f"Tailor application for {tailor.full_name} approved successfully!"
    )


@router.post("/applications/{user_id}/reject", response_model=MessageResponse)
async def reject_tailor_application(
    user_id: int,
    approval_data: ApprovalRequest,
    current_user: Annotated[User, Depends(require_role([UserRole.ADMIN.value]))],
    db: Annotated[AsyncSession, Depends(get_db)],
    request: Request,
):
    """Reject tailor application (admin only)."""
    from app.core.audit import create_audit_log
    
    # Get tailor application
    result = await db.execute(
        select(User).where(
            and_(
                User.id == user_id,
                User.role == UserRole.TAILOR.value,
                User.account_status == "pending"
            )
        )
    )
    tailor = result.scalar_one_or_none()
    
    if not tailor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pending application not found",
        )
    
    # Reject application
    tailor.account_status = "rejected"
    tailor.approved_by_id = current_user.id
    tailor.approved_at = datetime.utcnow()
    tailor.approval_notes = approval_data.notes or "Application rejected"
    
    await db.commit()
    await db.refresh(tailor)
    
    # Log rejection
    await create_audit_log(
        db=db,
        action="tailor.rejected",
        user=current_user,
        resource_type="user",
        resource_id=tailor.id,
        details={
            "tailor_name": tailor.full_name,
            "tailor_email": tailor.email,
            "reason": approval_data.notes,
        },
        request=request,
    )
    
    # TODO: Send rejection notification email to tailor
    
    return MessageResponse(
        message=f"Tailor application for {tailor.full_name} rejected."
    )
