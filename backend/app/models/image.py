from sqlalchemy import Column, Integer, String, DateTime, BigInteger, ForeignKey, Text, JSON, LargeBinary
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    file_size = Column(BigInteger)
    dimensions = Column(JSON)  # {"width": 1920, "height": 1080}
    exif_data = Column(JSON)  # EXIF data, camera info, etc. (renamed from metadata to avoid SQLAlchemy conflict)
    description = Column(Text)  # AI-generated description
    # Store embeddings as binary data (can be converted back to numpy array when needed)
    # Note: For semantic search, install pgvector extension and change this to Vector(512)
    embedding = Column(LargeBinary)  # CLIP embeddings stored as bytes
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="images")
    tags = relationship("ImageTag", back_populates="image", cascade="all, delete-orphan")
    versions = relationship("ImageVersion", back_populates="original_image", cascade="all, delete-orphan")


class ImageTag(Base):
    __tablename__ = "image_tags"

    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("images.id"), nullable=False)
    tag = Column(String(100), nullable=False, index=True)
    confidence = Column(String(10))  # Store as string to avoid float precision issues
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    image = relationship("Image", back_populates="tags")


class ImageVersion(Base):
    __tablename__ = "image_versions"

    id = Column(Integer, primary_key=True, index=True)
    original_image_id = Column(Integer, ForeignKey("images.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=False)
    edit_description = Column(Text)  # Description of edits made
    edit_type = Column(String(50))  # "manual" or "ai"
    edit_prompt = Column(Text)  # For AI edits, the prompt used
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    original_image = relationship("Image", back_populates="versions")
