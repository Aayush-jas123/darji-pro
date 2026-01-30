"""Common schemas used across the application."""

from typing import Optional, Generic, TypeVar
from pydantic import BaseModel


T = TypeVar('T')


class PaginationParams(BaseModel):
    """Schema for pagination parameters."""
    page: int = 1
    page_size: int = 20
    
    @property
    def offset(self) -> int:
        """Calculate offset for database query."""
        return (self.page - 1) * self.page_size


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic schema for paginated responses."""
    total: int
    page: int
    page_size: int
    total_pages: int
    items: list[T]


class MessageResponse(BaseModel):
    """Schema for simple message responses."""
    message: str
    detail: Optional[str] = None


class ErrorResponse(BaseModel):
    """Schema for error responses."""
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None


class SuccessResponse(BaseModel):
    """Schema for success responses."""
    success: bool = True
    message: str
    data: Optional[dict] = None
