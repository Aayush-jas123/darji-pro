"""Measurement management API routes."""

from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.measurement import MeasurementProfile, MeasurementVersion, MeasurementStatus
from app.schemas.measurement import (
    MeasurementProfileCreate,
    MeasurementProfileUpdate,
    MeasurementProfileResponse,
    MeasurementProfileWithVersionResponse,
    MeasurementVersionCreate,
    MeasurementVersionResponse,
    MeasurementApproval,
)
from app.schemas.common import MessageResponse

router = APIRouter()


@router.get("/debug-raw")
async def debug_measurements_raw(
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Temporary debug endpoint to inspect raw data."""
    # Getting raw dictionaries to bypass pydantic validation
    # Join with current version to see measurements
    stmt = (
        select(MeasurementProfile, MeasurementVersion)
        .outerjoin(
            MeasurementVersion, 
            (MeasurementVersion.profile_id == MeasurementProfile.id) & 
            (MeasurementVersion.version_number == MeasurementProfile.current_version)
        )
    )
    result = await db.execute(stmt)
    rows = result.all()
    
    debug_data = []
    for p, v in rows:
        version_data = None
        if v:
            version_data = {
                "id": v.id,
                "version_number": v.version_number,
                "fit_preference": str(v.fit_preference),
                "neck": v.neck,
                "chest": v.chest,
                "waist": v.waist,
                "hip": v.hip,
                "height": v.additional_measurements.get("height") if v.additional_measurements else None,
                "weight": v.additional_measurements.get("weight") if v.additional_measurements else None,
                "additional_measurements": v.additional_measurements
            }
            
        debug_data.append({
            "profile": {
                "id": p.id,
                "profile_name": p.profile_name,
                "status": str(p.status),
                "current_version": p.current_version,
                "customer_id": p.customer_id,
            },
            "current_measurements": version_data
        })
    
    return debug_data


@router.get("/debug-pdf-diagnostic")
async def debug_pdf_diagnostic():
    """Diagnostic endpoint to debug PDF generation issues."""
    results = {}
    
    # 1. Check Import
    try:
        import reportlab
        results["reportlab_version"] = reportlab.__version__
        results["import_status"] = "Success"
    except ImportError as e:
        return {"status": "error", "error": f"ImportError: {e}", "stage": "import"}
    except Exception as e:
        return {"status": "error", "error": f"Unexpected Error during import: {e}", "stage": "import"}

    # 2. Check Service Instantiation
    try:
        from app.services.pdf_service import pdf_service
        results["service_status"] = "Loaded"
    except Exception as e:
        return {"status": "error", "error": f"Service Load Error: {e}", "stage": "service_load"}
        
    # 3. Check PDF Gen (Dummy)
    try:
        buffer = pdf_service.generate_measurement_pdf(
            customer_name="Test User",
            profile_name="Test Profile",
            measurements={"chest": 40.0, "waist": 32.0},
            fit_preference="regular"
        )
        results["generation_status"] = f"Success, size={buffer.getbuffer().nbytes} bytes"
    except Exception as e:
        import traceback
        return {
            "status": "error", 
            "error": f"Generation Error: {e}", 
            "stage": "generation", 
            "trace": traceback.format_exc()
        }
        
    return results


@router.post("", response_model=MeasurementProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_measurement_profile(
    profile_data: MeasurementProfileCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Create a new measurement profile.
    
    - **profile_name**: Name for this measurement profile
    - **measurements**: Detailed body measurements
    """
    # Create profile
    new_profile = MeasurementProfile(
        customer_id=current_user.id,
        profile_name=profile_data.profile_name,
        is_default=profile_data.is_default,
        status=MeasurementStatus.DRAFT,
        current_version=1,
    )
    
    db.add(new_profile)
    await db.flush()  # Get the profile ID
    
    # Create first version
    new_version = MeasurementVersion(
        profile_id=new_profile.id,
        version_number=1,
        **profile_data.measurements.model_dump(exclude_none=True),
        measured_by_id=current_user.id,
    )
    
    db.add(new_version)
    await db.commit()
    await db.refresh(new_profile)
    
    return new_profile


@router.get("", response_model=list[MeasurementProfileResponse])
async def list_measurement_profiles(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    customer_id: Optional[int] = None,
):
    """
    List measurement profiles.
    
    - Customers see their own profiles
    - Tailors/Admins can see all profiles or filter by customer_id
    """
    query = select(MeasurementProfile)
    
    # Filter based on user role
    if current_user.is_customer:
        query = query.where(MeasurementProfile.customer_id == current_user.id)
    elif customer_id:
        query = query.where(MeasurementProfile.customer_id == customer_id)
    
    query = query.order_by(MeasurementProfile.created_at.desc())
    
    result = await db.execute(query)
    profiles = result.scalars().all()
    
    return profiles


@router.get("/{profile_id}", response_model=MeasurementProfileWithVersionResponse)
async def get_measurement_profile(
    profile_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get measurement profile with current version."""
    result = await db.execute(
        select(MeasurementProfile).where(MeasurementProfile.id == profile_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Measurement profile not found",
        )
    
    # Check permissions
    if current_user.is_customer and profile.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this profile",
        )
    
    # Get current version
    version_result = await db.execute(
        select(MeasurementVersion).where(
            MeasurementVersion.profile_id == profile_id,
            MeasurementVersion.version_number == profile.current_version,
        )
    )
    current_version = version_result.scalar_one_or_none()
    
    # Convert to response model
    profile_dict = {
        **profile.__dict__,
        "current_measurements": current_version,
    }
    
    return profile_dict


@router.put("/{profile_id}", response_model=MeasurementProfileResponse)
async def update_measurement_profile(
    profile_id: int,
    profile_update: MeasurementProfileUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Update measurement profile metadata."""
    result = await db.execute(
        select(MeasurementProfile).where(MeasurementProfile.id == profile_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Measurement profile not found",
        )
    
    # Check permissions
    if current_user.is_customer and profile.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    # Update fields
    if profile_update.profile_name is not None:
        profile.profile_name = profile_update.profile_name
    if profile_update.is_default is not None:
        profile.is_default = profile_update.is_default
    
    await db.commit()
    await db.refresh(profile)
    return profile


@router.post("/{profile_id}/versions", response_model=MeasurementVersionResponse)
async def create_measurement_version(
    profile_id: int,
    version_data: MeasurementVersionCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Create a new version of measurements for a profile."""
    result = await db.execute(
        select(MeasurementProfile).where(MeasurementProfile.id == profile_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Measurement profile not found",
        )
    
    # Check permissions
    if current_user.is_customer and profile.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    # Create new version
    new_version_number = profile.current_version + 1
    new_version = MeasurementVersion(
        profile_id=profile_id,
        version_number=new_version_number,
        **version_data.model_dump(exclude_none=True),
        measured_by_id=current_user.id,
    )
    
    db.add(new_version)
    
    # Update profile
    profile.current_version = new_version_number
    profile.status = MeasurementStatus.PENDING_REVIEW
    
    await db.commit()
    await db.refresh(new_version)
    
    return new_version


@router.get("/{profile_id}/versions", response_model=list[MeasurementVersionResponse])
async def list_measurement_versions(
    profile_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """List all versions of a measurement profile."""
    # Check profile exists and permissions
    profile_result = await db.execute(
        select(MeasurementProfile).where(MeasurementProfile.id == profile_id)
    )
    profile = profile_result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Measurement profile not found",
        )
    
    if current_user.is_customer and profile.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    # Get all versions
    result = await db.execute(
        select(MeasurementVersion)
        .where(MeasurementVersion.profile_id == profile_id)
        .order_by(MeasurementVersion.version_number.desc())
    )
    versions = result.scalars().all()
    
    return versions


@router.post("/{profile_id}/approve", response_model=MeasurementProfileResponse)
async def approve_measurement_profile(
    profile_id: int,
    approval_data: MeasurementApproval,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Approve or reject a measurement profile (Tailor/Admin only)."""
    if not (current_user.is_tailor or current_user.is_admin or current_user.is_staff):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tailors and admins can approve measurements",
        )
    
    result = await db.execute(
        select(MeasurementProfile).where(MeasurementProfile.id == profile_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Measurement profile not found",
        )
    
    # Update approval status
    from datetime import datetime
    
    if approval_data.approved:
        profile.status = MeasurementStatus.APPROVED
        profile.approved_by_id = current_user.id
        profile.approved_at = datetime.utcnow()
        profile.rejection_reason = None
    else:
        profile.status = MeasurementStatus.REJECTED
        profile.rejection_reason = approval_data.notes
        profile.approved_by_id = None
        profile.approved_at = None
    
    await db.commit()
    await db.refresh(profile)
    
    return profile


@router.get("/{profile_id}/export-pdf")
async def export_measurement_pdf(
    profile_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Export measurement profile as PDF.
    
    Returns a professionally formatted PDF document with all measurements.
    """
    from fastapi.responses import StreamingResponse
    from app.services.pdf_service import pdf_service
    
    # Get profile
    result = await db.execute(
        select(MeasurementProfile).where(MeasurementProfile.id == profile_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Measurement profile not found",
        )
    
    # Check permissions
    if current_user.is_customer and profile.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to export this profile",
        )
    
    # Get current version
    version_result = await db.execute(
        select(MeasurementVersion).where(
            MeasurementVersion.profile_id == profile_id,
            MeasurementVersion.version_number == profile.current_version,
        )
    )
    current_version = version_result.scalar_one_or_none()
    
    if not current_version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No measurements found for this profile",
        )
    
    # Get customer info
    customer_result = await db.execute(
        select(User).where(User.id == profile.customer_id)
    )
    customer = customer_result.scalar_one_or_none()
    
    # Get measured by info
    measured_by_name = None
    if current_version.measured_by_id:
        measured_by_result = await db.execute(
            select(User).where(User.id == current_version.measured_by_id)
        )
        measured_by = measured_by_result.scalar_one_or_none()
        if measured_by:
            measured_by_name = measured_by.full_name
    
    # Prepare measurements dict
    measurements = {
        'neck': current_version.neck,
        'shoulder': current_version.shoulder,
        'chest': current_version.chest,
        'waist': current_version.waist,
        'hip': current_version.hip,
        'arm_length': current_version.arm_length,
        'sleeve_length': current_version.sleeve_length,
        'bicep': current_version.bicep,
        'wrist': current_version.wrist,
        'inseam': current_version.inseam,
        'outseam': current_version.outseam,
        'thigh': current_version.thigh,
        'knee': current_version.knee,
        'calf': current_version.calf,
        'ankle': current_version.ankle,
        'back_length': current_version.back_length,
        'front_length': current_version.front_length,
    }
    
    # Combine notes
    notes_parts = []
    if current_version.posture_notes:
        notes_parts.append(f"Posture Notes: {current_version.posture_notes}")
    if current_version.special_requirements:
        notes_parts.append(f"Special Requirements: {current_version.special_requirements}")
    if current_version.change_notes:
        notes_parts.append(f"Changes: {current_version.change_notes}")
    
    notes = "\n".join(notes_parts) if notes_parts else None
    
    # Generate PDF
    try:
        pdf_buffer = pdf_service.generate_measurement_pdf(
            customer_name=customer.full_name if customer else "Unknown Customer",
            profile_name=profile.profile_name,
            measurements=measurements,
            fit_preference=current_version.fit_preference,
            measured_by=measured_by_name,
            measurement_date=current_version.created_at,
            notes=notes
        )
    except ImportError as e:
        print(f"PDF Service Import Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="PDF generation service unavailable (missing dependencies)",
        )
    except Exception as e:
        print(f"PDF Generation Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {str(e)}",
        )
    
    # Return PDF as download
    filename = f"measurement_{profile.profile_name.replace(' ', '_')}_{profile_id}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.delete("/{profile_id}", response_model=MessageResponse)
async def delete_measurement_profile(
    profile_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Delete a measurement profile."""
    result = await db.execute(
        select(MeasurementProfile).where(MeasurementProfile.id == profile_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Measurement profile not found",
        )
    
    # Check permissions
    if current_user.is_customer and profile.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    await db.delete(profile)
    await db.commit()
    
    return {"message": "Measurement profile deleted successfully"}



