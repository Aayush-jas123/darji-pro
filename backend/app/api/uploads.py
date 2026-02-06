"""File upload API routes."""

from typing import Annotated, List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Query
from fastapi.responses import FileResponse

from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.file_service import file_service
from app.schemas.common import MessageResponse


router = APIRouter()


@router.post("/design", status_code=status.HTTP_201_CREATED)
async def upload_design_image(
    file: UploadFile = File(...),
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """
    Upload a design image.
    
    - **file**: Image file (JPG, PNG, WEBP, GIF)
    - Max size: 10MB
    """
    try:
        result = await file_service.upload_design_image(file)
        return {
            "message": "Design image uploaded successfully",
            **result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/design/multiple", status_code=status.HTTP_201_CREATED)
async def upload_multiple_design_images(
    files: List[UploadFile] = File(...),
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """
    Upload multiple design images.
    
    - **files**: Multiple image files
    - Max size per file: 10MB
    """
    results = await file_service.upload_multiple_files(files, upload_type="design")
    
    successful = [r for r in results if "error" not in r]
    failed = [r for r in results if "error" in r]
    
    return {
        "message": f"Uploaded {len(successful)} of {len(files)} files successfully",
        "successful": successful,
        "failed": failed
    }


@router.post("/fabric", status_code=status.HTTP_201_CREATED)
async def upload_fabric_image(
    file: UploadFile = File(...),
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """
    Upload a fabric image.
    
    - **file**: Image file (JPG, PNG, WEBP, GIF)
    - Max size: 10MB
    """
    try:
        result = await file_service.upload_fabric_image(file)
        return {
            "message": "Fabric image uploaded successfully",
            **result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/measurement", status_code=status.HTTP_201_CREATED)
async def upload_measurement_image(
    file: UploadFile = File(...),
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """
    Upload a measurement reference image.
    
    - **file**: Image file (JPG, PNG, WEBP, GIF)
    - Max size: 10MB
    """
    try:
        result = await file_service.upload_measurement_image(file)
        return {
            "message": "Measurement image uploaded successfully",
            **result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/profile", status_code=status.HTTP_201_CREATED)
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """
    Upload a profile picture.
    
    - **file**: Image file (JPG, PNG, WEBP, GIF)
    - Max size: 10MB
    - Automatically resized to 500x500
    """
    try:
        result = await file_service.upload_profile_image(file)
        return {
            "message": "Profile image uploaded successfully",
            **result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{file_path:path}")
async def get_uploaded_file(file_path: str):
    """
    Retrieve an uploaded file.
    
    - **file_path**: Relative path to the file
    """
    absolute_path = file_service.get_file_path(file_path)
    
    if not absolute_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    return FileResponse(absolute_path)


@router.delete("/{file_path:path}", response_model=MessageResponse)
async def delete_uploaded_file(
    file_path: str,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """
    Delete an uploaded file.
    
    - **file_path**: Relative path to the file
    """
    # Only admins and the file owner can delete
    if not (current_user.is_admin or current_user.is_staff):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete files"
        )
    
    success = file_service.delete_file(file_path)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found or could not be deleted"
        )
    
    return {"message": "File deleted successfully"}
