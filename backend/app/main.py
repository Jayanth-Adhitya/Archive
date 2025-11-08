from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import HTTPException
import os
from .core.config import settings
from .core.database import Base, engine, SessionLocal
from .api import auth, images, chat
from .models.user import User
from .core.security import get_password_hash

# Create database tables
Base.metadata.create_all(bind=engine)

# Create default user if it doesn't exist
def create_default_user():
    db = SessionLocal()
    try:
        default_user = db.query(User).filter(User.id == 1).first()
        if not default_user:
            default_user = User(
                email="demo@example.com",
                password_hash=get_password_hash("demo123")
            )
            db.add(default_user)
            db.commit()
            print("✅ Default user created (ID: 1, email: demo@example.com, password: demo123)")
        else:
            # Update email if it's still the old .local domain
            if default_user.email == "default@imageapp.local":
                default_user.email = "demo@example.com"
                default_user.password_hash = get_password_hash("demo123")
                db.commit()
                print("✅ Default user updated to demo@example.com")
            else:
                print("✅ Default user already exists")
    except Exception as e:
        print(f"⚠️ Error creating default user: {e}")
    finally:
        db.close()

create_default_user()

# Create FastAPI app
app = FastAPI(
    title="AI Image Archive API",
    description="AI-powered image management platform with automatic tagging and conversational assistant",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom endpoint to serve images with CORS headers
from fastapi import Response

@app.options("/uploads/{user_id}/{filename:path}")
async def serve_image_options(user_id: str, filename: str):
    """Handle preflight CORS request for images"""
    return Response(
        content="",
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.get("/uploads/{user_id}/{filename:path}")
async def serve_image(user_id: str, filename: str):
    """Serve uploaded images with CORS headers"""
    file_path = os.path.join(settings.UPLOAD_DIR, user_id, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")

    # Detect image type
    ext = os.path.splitext(filename)[1].lower()
    media_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
    }
    media_type = media_types.get(ext, 'image/jpeg')

    return FileResponse(
        file_path,
        media_type=media_type,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Cache-Control": "public, max-age=31536000",
        }
    )

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(images.router, prefix="/api")
app.include_router(chat.router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Image Archive API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
