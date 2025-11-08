from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, List, Dict, Any
import os


class ImageTagResponse(BaseModel):
    """Schema for image tag response"""
    id: int
    tag: str
    confidence: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ImageVersionResponse(BaseModel):
    """Schema for image version response"""
    id: int
    version_number: int
    file_path: str
    edit_description: Optional[str]
    edit_type: str
    edit_prompt: Optional[str]
    created_at: datetime

    @field_validator('file_path', mode='before')
    @classmethod
    def normalize_file_path(cls, v):
        """Convert filesystem path to full backend URL"""
        # Already a full URL, return as-is
        if v.startswith('http'):
            return v

        # Remove leading ./ if present
        if v.startswith('./'):
            v = v[2:]

        # Replace absolute upload directory path with relative /uploads
        if '/app/uploads/' in v:
            v = v.replace('/app/uploads/', '/uploads/')
        elif 'uploads/' in v and not v.startswith('/uploads/'):
            v = '/' + v

        # HARDCODED backend URL for api.archive.mehh.ae
        v = f"https://api.archive.mehh.ae{v}"

        return v

    class Config:
        from_attributes = True


class ImageResponse(BaseModel):
    """Schema for image response"""
    id: int
    user_id: int
    filename: str
    file_path: str
    upload_date: datetime
    file_size: Optional[int]
    dimensions: Optional[Dict[str, int]]
    exif_data: Optional[Dict[str, Any]]
    description: Optional[str]
    tags: List[ImageTagResponse] = []
    versions: List[ImageVersionResponse] = []

    @field_validator('file_path', mode='before')
    @classmethod
    def normalize_file_path(cls, v):
        """Convert filesystem path to full backend URL"""
        # Already a full URL, return as-is
        if v.startswith('http'):
            return v

        # Remove leading ./ if present
        if v.startswith('./'):
            v = v[2:]

        # Replace absolute upload directory path with relative /uploads
        if '/app/uploads/' in v:
            v = v.replace('/app/uploads/', '/uploads/')
        elif 'uploads/' in v and not v.startswith('/uploads/'):
            v = '/' + v

        # HARDCODED backend URL for api.archive.mehh.ae
        v = f"https://api.archive.mehh.ae{v}"

        return v

    class Config:
        from_attributes = True


class ImageUploadResponse(BaseModel):
    """Schema for image upload response"""
    message: str
    image: ImageResponse
    tags_generated: int


class ImageSearchRequest(BaseModel):
    """Schema for image search request"""
    query: str
    search_type: str = "tags"  # "tags", "semantic", or "ai"
    limit: int = 20


class ImageEditRequest(BaseModel):
    """Schema for image edit request"""
    image_id: int
    edit_type: str  # "manual" or "ai"
    edit_prompt: Optional[str] = None
    edit_params: Optional[Dict[str, Any]] = None  # For manual edits: brightness, contrast, etc.
