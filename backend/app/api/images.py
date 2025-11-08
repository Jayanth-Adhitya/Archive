from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from datetime import datetime
from PIL import Image as PILImage
from ..core.database import get_db
from ..core.config import settings
from ..core.security import get_current_user
from ..schemas.image import ImageResponse, ImageUploadResponse, ImageSearchRequest
from ..models.user import User
from ..models.image import Image, ImageTag
from ..services.clip_service import get_clip_service

router = APIRouter(prefix="/images", tags=["images"])


def save_upload_file(upload_file: UploadFile, user_id: int) -> tuple[str, dict]:
    """
    Save uploaded file and return file path and metadata

    Returns:
        Tuple of (file_path, metadata_dict)
    """
    # Create user-specific directory
    user_dir = os.path.join(settings.UPLOAD_DIR, str(user_id))
    os.makedirs(user_dir, exist_ok=True)

    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{upload_file.filename}"
    file_path = os.path.join(user_dir, filename)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    # Extract metadata
    try:
        img = PILImage.open(file_path)
        metadata = {
            "width": img.width,
            "height": img.height,
            "format": img.format,
            "mode": img.mode
        }

        # Try to get EXIF data
        exif_data = {}
        if hasattr(img, '_getexif') and img._getexif():
            from PIL.ExifTags import TAGS
            exif = {TAGS.get(k, k): str(v) for k, v in img._getexif().items() if k in TAGS}
            exif_data = exif

        metadata["exif"] = exif_data
        img.close()

        return file_path, metadata

    except Exception as e:
        print(f"Error extracting metadata: {e}")
        return file_path, {}


@router.post("/upload", response_model=ImageUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload an image and automatically generate tags using CLIP"""

    # Validate file type
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in settings.allowed_extensions_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file_ext} not allowed. Allowed types: {', '.join(settings.allowed_extensions_list)}"
        )

    # Save file
    try:
        file_path, metadata = save_upload_file(file, current_user.id)
        file_size = os.path.getsize(file_path)

        # Check file size
        if file_size > settings.MAX_UPLOAD_SIZE:
            os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE} bytes"
            )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving file: {str(e)}"
        )

    # Generate tags and embedding using CLIP
    try:
        clip_service = get_clip_service()

        # Generate tags
        tags = clip_service.generate_tags(file_path, top_k=10, threshold=0.15)

        # Generate embedding
        embedding = clip_service.generate_embedding(file_path)

        # Generate description
        description = clip_service.generate_description(file_path)

    except Exception as e:
        print(f"Error generating tags/embeddings: {e}")
        tags = []
        embedding = None
        description = None

    # Create image record in database
    dimensions = {"width": metadata.get("width"), "height": metadata.get("height")} if metadata else None

    new_image = Image(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        file_size=file_size,
        dimensions=dimensions,
        exif_data=metadata,
        description=description,
        embedding=embedding.tobytes() if embedding is not None else None  # Store as bytes
    )

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    # Create tag records
    for tag, confidence in tags:
        image_tag = ImageTag(
            image_id=new_image.id,
            tag=tag,
            confidence=f"{confidence:.3f}"
        )
        db.add(image_tag)

    db.commit()
    db.refresh(new_image)

    return {
        "message": "Image uploaded successfully",
        "image": new_image,
        "tags_generated": len(tags)
    }


@router.get("/", response_model=List[ImageResponse])
async def list_images(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all images"""

    images = db.query(Image)\
        .filter(Image.user_id == current_user.id)\
        .order_by(Image.upload_date.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

    return images


@router.get("/{image_id}", response_model=ImageResponse)
async def get_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific image by ID"""

    image = db.query(Image).filter(
        Image.id == image_id,
        Image.user_id == current_user.id
    ).first()

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )

    return image


@router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an image"""

    image = db.query(Image).filter(
        Image.id == image_id,
        Image.user_id == current_user.id
    ).first()

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )

    # Delete file from filesystem
    try:
        if os.path.exists(image.file_path):
            os.remove(image.file_path)

        # Delete version files
        for version in image.versions:
            if os.path.exists(version.file_path):
                os.remove(version.file_path)

    except Exception as e:
        print(f"Error deleting files: {e}")

    # Delete from database (cascade will handle tags and versions)
    db.delete(image)
    db.commit()

    return None


@router.get("/search/tags", response_model=List[ImageResponse])
async def search_images_by_tags(
    query: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search images by tags"""

    # Get distinct image IDs matching the tag search
    from sqlalchemy import distinct

    image_ids_subquery = db.query(distinct(ImageTag.image_id))\
        .filter(ImageTag.tag.ilike(f"%{query}%"))\
        .subquery()

    # Get the images with those IDs
    images = db.query(Image)\
        .filter(
            Image.user_id == current_user.id,
            Image.id.in_(image_ids_subquery)
        )\
        .order_by(Image.upload_date.desc())\
        .limit(limit)\
        .all()

    return images


@router.post("/{image_id}/save-edited", response_model=ImageResponse)
async def save_edited_image(
    image_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Save an edited version of an image"""

    # Get the original image
    original_image = db.query(Image).filter(
        Image.id == image_id,
        Image.user_id == current_user.id
    ).first()

    if not original_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )

    # Save the edited file
    try:
        # Create filename with "edited_" prefix
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"edited_{timestamp}_{original_image.filename}"

        # Create user-specific directory
        user_dir = os.path.join(settings.UPLOAD_DIR, str(current_user.id))
        os.makedirs(user_dir, exist_ok=True)

        file_path = os.path.join(user_dir, filename)

        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = os.path.getsize(file_path)

        # Get metadata from edited image
        try:
            img = PILImage.open(file_path)
            metadata = {
                "width": img.width,
                "height": img.height,
                "format": img.format,
                "mode": img.mode
            }
            dimensions = {"width": img.width, "height": img.height}
            img.close()
        except Exception:
            metadata = {}
            dimensions = None

        # Create new image record for edited version
        new_image = Image(
            user_id=current_user.id,
            filename=filename,
            file_path=file_path,
            file_size=file_size,
            dimensions=dimensions,
            exif_data=metadata,
            description=f"Edited version of {original_image.filename}",
            embedding=original_image.embedding  # Copy embedding from original
        )

        db.add(new_image)
        db.commit()
        db.refresh(new_image)

        # Copy tags from original image
        for tag in original_image.tags:
            image_tag = ImageTag(
                image_id=new_image.id,
                tag=tag.tag,
                confidence=tag.confidence
            )
            db.add(image_tag)

        db.commit()
        db.refresh(new_image)

        return new_image

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving edited image: {str(e)}"
        )
