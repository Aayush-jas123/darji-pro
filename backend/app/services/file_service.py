"""File upload service for handling image and document uploads."""

import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional, List
from fastapi import UploadFile, HTTPException, status
from PIL import Image
import aiofiles

from app.core.config import settings


class FileService:
    """Service for handling file uploads and storage."""
    
    ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
    ALLOWED_DOCUMENT_EXTENSIONS = {'.pdf', '.doc', '.docx'}
    MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
    MAX_DOCUMENT_SIZE = 20 * 1024 * 1024  # 20MB
    
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Create subdirectories
        self.design_dir = self.upload_dir / "designs"
        self.fabric_dir = self.upload_dir / "fabrics"
        self.measurement_dir = self.upload_dir / "measurements"
        self.profile_dir = self.upload_dir / "profiles"
        
        for directory in [self.design_dir, self.fabric_dir, self.measurement_dir, self.profile_dir]:
            directory.mkdir(parents=True, exist_ok=True)
    
    def _get_file_extension(self, filename: str) -> str:
        """Get file extension in lowercase."""
        return Path(filename).suffix.lower()
    
    def _generate_unique_filename(self, original_filename: str) -> str:
        """Generate a unique filename while preserving extension."""
        extension = self._get_file_extension(original_filename)
        unique_id = uuid.uuid4().hex
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        return f"{timestamp}_{unique_id}{extension}"
    
    def _validate_image(self, file: UploadFile) -> None:
        """Validate image file."""
        extension = self._get_file_extension(file.filename or '')
        
        if extension not in self.ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed: {', '.join(self.ALLOWED_IMAGE_EXTENSIONS)}"
            )
        
        if file.size and file.size > self.MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Maximum size: {self.MAX_IMAGE_SIZE / 1024 / 1024}MB"
            )
    
    def _validate_document(self, file: UploadFile) -> None:
        """Validate document file."""
        extension = self._get_file_extension(file.filename or '')
        
        if extension not in self.ALLOWED_DOCUMENT_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed: {', '.join(self.ALLOWED_DOCUMENT_EXTENSIONS)}"
            )
        
        if file.size and file.size > self.MAX_DOCUMENT_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Maximum size: {self.MAX_DOCUMENT_SIZE / 1024 / 1024}MB"
            )
    
    async def save_file(self, file: UploadFile, directory: Path) -> str:
        """
        Save uploaded file to specified directory.
        
        Args:
            file: Uploaded file
            directory: Target directory
            
        Returns:
            str: Relative path to saved file
        """
        unique_filename = self._generate_unique_filename(file.filename or 'upload')
        file_path = directory / unique_filename
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Return relative path from upload directory
        return str(file_path.relative_to(self.upload_dir))
    
    async def upload_design_image(self, file: UploadFile) -> dict:
        """
        Upload design image.
        
        Args:
            file: Image file
            
        Returns:
            dict: File information including URL and metadata
        """
        self._validate_image(file)
        
        # Save file
        relative_path = await self.save_file(file, self.design_dir)
        
        # Get image dimensions
        file_path = self.upload_dir / relative_path
        try:
            with Image.open(file_path) as img:
                width, height = img.size
        except Exception:
            width, height = None, None
        
        return {
            "filename": Path(relative_path).name,
            "path": relative_path,
            "url": f"/api/uploads/{relative_path}",
            "size": file.size,
            "width": width,
            "height": height,
            "uploaded_at": datetime.now().isoformat()
        }
    
    async def upload_fabric_image(self, file: UploadFile) -> dict:
        """
        Upload fabric image.
        
        Args:
            file: Image file
            
        Returns:
            dict: File information
        """
        self._validate_image(file)
        relative_path = await self.save_file(file, self.fabric_dir)
        
        return {
            "filename": Path(relative_path).name,
            "path": relative_path,
            "url": f"/api/uploads/{relative_path}",
            "size": file.size,
            "uploaded_at": datetime.now().isoformat()
        }
    
    async def upload_measurement_image(self, file: UploadFile) -> dict:
        """
        Upload measurement reference image.
        
        Args:
            file: Image file
            
        Returns:
            dict: File information
        """
        self._validate_image(file)
        relative_path = await self.save_file(file, self.measurement_dir)
        
        return {
            "filename": Path(relative_path).name,
            "path": relative_path,
            "url": f"/api/uploads/{relative_path}",
            "size": file.size,
            "uploaded_at": datetime.now().isoformat()
        }
    
    async def upload_profile_image(self, file: UploadFile) -> dict:
        """
        Upload user profile image.
        
        Args:
            file: Image file
            
        Returns:
            dict: File information
        """
        self._validate_image(file)
        relative_path = await self.save_file(file, self.profile_dir)
        
        # Optionally resize for profile pictures
        file_path = self.upload_dir / relative_path
        try:
            with Image.open(file_path) as img:
                # Resize to max 500x500 while maintaining aspect ratio
                img.thumbnail((500, 500), Image.Resampling.LANCZOS)
                img.save(file_path, optimize=True, quality=85)
        except Exception as e:
            print(f"Warning: Could not optimize profile image: {e}")
        
        return {
            "filename": Path(relative_path).name,
            "path": relative_path,
            "url": f"/api/uploads/{relative_path}",
            "size": file.size,
            "uploaded_at": datetime.now().isoformat()
        }
    
    async def upload_multiple_files(
        self,
        files: List[UploadFile],
        upload_type: str = "design"
    ) -> List[dict]:
        """
        Upload multiple files.
        
        Args:
            files: List of files to upload
            upload_type: Type of upload (design, fabric, measurement, profile)
            
        Returns:
            List[dict]: List of file information
        """
        upload_methods = {
            "design": self.upload_design_image,
            "fabric": self.upload_fabric_image,
            "measurement": self.upload_measurement_image,
            "profile": self.upload_profile_image
        }
        
        upload_method = upload_methods.get(upload_type, self.upload_design_image)
        
        results = []
        for file in files:
            try:
                result = await upload_method(file)
                results.append(result)
            except Exception as e:
                results.append({
                    "filename": file.filename,
                    "error": str(e),
                    "success": False
                })
        
        return results
    
    def delete_file(self, relative_path: str) -> bool:
        """
        Delete a file.
        
        Args:
            relative_path: Relative path from upload directory
            
        Returns:
            bool: True if deleted successfully
        """
        try:
            file_path = self.upload_dir / relative_path
            if file_path.exists() and file_path.is_file():
                file_path.unlink()
                return True
            return False
        except Exception as e:
            print(f"Error deleting file: {e}")
            return False
    
    def get_file_path(self, relative_path: str) -> Optional[Path]:
        """
        Get absolute path for a file.
        
        Args:
            relative_path: Relative path from upload directory
            
        Returns:
            Optional[Path]: Absolute path if file exists
        """
        file_path = self.upload_dir / relative_path
        if file_path.exists() and file_path.is_file():
            return file_path
        return None


# Global instance
file_service = FileService()
