from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.image import Image, ImageTag
from ..services.gemini_service import get_gemini_service

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatMessage(BaseModel):
    """Schema for chat message"""
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = []
    include_images: bool = True


class ChatResponse(BaseModel):
    """Schema for chat response"""
    response: str
    suggested_images: Optional[List[int]] = None


@router.post("/message", response_model=ChatResponse)
async def send_message(
    chat_data: ChatMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a message to the AI assistant"""

    gemini_service = get_gemini_service()

    # Get user's images for context
    image_context = None
    if chat_data.include_images:
        images = db.query(Image)\
            .filter(Image.user_id == current_user.id)\
            .order_by(Image.upload_date.desc())\
            .limit(50)\
            .all()

        # Build image context
        image_context = []
        for img in images:
            tags = [tag.tag for tag in img.tags]
            image_context.append({
                "id": img.id,
                "filename": img.filename,
                "upload_date": str(img.upload_date),
                "tags": tags,
                "description": img.description
            })

    # Get response from Gemini
    try:
        result = await gemini_service.chat(
            message=chat_data.message,
            image_context=image_context,
            conversation_history=chat_data.conversation_history
        )

        return {
            "response": result["text"],
            "suggested_images": result.get("image_ids")
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error communicating with AI: {str(e)}"
        )


class TaskAssistRequest(BaseModel):
    """Schema for task assistance request"""
    task_description: str
    max_images: int = 20


@router.post("/assist", response_model=Dict[str, Any])
async def assist_with_task(
    request: TaskAssistRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI assistance for a specific task (e.g., creating a newsletter)"""

    gemini_service = get_gemini_service()

    # Get user's images
    images = db.query(Image)\
        .filter(Image.user_id == current_user.id)\
        .order_by(Image.upload_date.desc())\
        .limit(request.max_images)\
        .all()

    # Build image list
    available_images = []
    for img in images:
        tags = [tag.tag for tag in img.tags]
        available_images.append({
            "id": img.id,
            "filename": img.filename,
            "upload_date": str(img.upload_date),
            "tags": tags,
            "description": img.description
        })

    # Get suggestions from Gemini
    try:
        result = await gemini_service.suggest_images_for_task(
            task_description=request.task_description,
            available_images=available_images
        )

        return result

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting task assistance: {str(e)}"
        )


class ImageAnalysisRequest(BaseModel):
    """Schema for image analysis request"""
    image_id: int
    query: str


@router.post("/analyze-image")
async def analyze_image(
    request: ImageAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analyze a specific image using AI"""

    # Get the image
    image = db.query(Image).filter(
        Image.id == request.image_id,
        Image.user_id == current_user.id
    ).first()

    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )

    gemini_service = get_gemini_service()

    try:
        analysis = await gemini_service.analyze_image(
            image_path=image.file_path,
            query=request.query
        )

        return {
            "image_id": image.id,
            "query": request.query,
            "analysis": analysis
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing image: {str(e)}"
        )
