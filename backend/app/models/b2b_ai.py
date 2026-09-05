import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, Integer, Numeric, JSON
from sqlalchemy.orm import relationship
from .base import UUIDType, Base


class B2BRequest(Base):
    __tablename__ = "b2b_requests"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    buyer_id = Column(UUIDType, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    craft = Column(String(100), nullable=True)
    material = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)
    quantity_required = Column(Integer, nullable=False)
    budget_min = Column(Integer, nullable=True)
    budget_max = Column(Integer, nullable=True)
    deadline = Column(DateTime, nullable=True)
    status = Column(String(30), default="open", nullable=False)
    priority = Column(String(20), default="medium", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)

    buyer = relationship("User", foreign_keys=[buyer_id])
    category = relationship("Category")
    matches = relationship("B2BMatch", back_populates="request", cascade="all, delete-orphan")


class B2BMatch(Base):
    __tablename__ = "b2b_matches"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    b2b_request_id = Column(UUIDType, ForeignKey("b2b_requests.id"), nullable=False)
    artwork_id = Column(UUIDType, ForeignKey("artworks.id"), nullable=True)
    artisan_id = Column(UUIDType, ForeignKey("users.id"), nullable=False)
    match_score = Column(Numeric(precision=5, scale=2), nullable=False)
    match_factors = Column(JSON, nullable=True)
    is_accepted = Column(Boolean, default=False, nullable=False)
    is_rejected = Column(Boolean, default=False, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    responded_at = Column(DateTime, nullable=True)

    request = relationship("B2BRequest", back_populates="matches")
    artwork = relationship("Artwork", back_populates="b2b_matches")
    artisan = relationship("User", foreign_keys=[artisan_id])


class AICatalog(Base):
    __tablename__ = "ai_catalogs"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    artwork_id = Column(UUIDType, ForeignKey("artworks.id"), nullable=True)
    input_text = Column(Text, nullable=False)
    input_language = Column(String(10), default="en", nullable=False)
    generated_title = Column(String(255), nullable=True)
    generated_description = Column(Text, nullable=True)
    generated_category = Column(String(100), nullable=True)
    generated_craft = Column(String(100), nullable=True)
    generated_material = Column(String(100), nullable=True)
    generated_region = Column(String(100), nullable=True)
    generated_tags = Column(String(1000), nullable=True)
    generated_seo_keywords = Column(String(1000), nullable=True)
    generated_care_instructions = Column(Text, nullable=True)
    generated_dimensions = Column(String(200), nullable=True)
    generated_production_time = Column(Integer, nullable=True)
    confidence_score = Column(Numeric(precision=5, scale=2), nullable=True)
    is_applied = Column(Boolean, default=False, nullable=False)
    provider = Column(String(50), default="mock", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    applied_at = Column(DateTime, nullable=True)

    artwork = relationship("Artwork", back_populates="ai_catalogs")


class AIPricePrediction(Base):
    __tablename__ = "ai_price_predictions"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    artwork_id = Column(UUIDType, ForeignKey("artworks.id"), nullable=True)
    inputs = Column(JSON, nullable=False)
    suggested_price = Column(Integer, nullable=False)
    min_price = Column(Integer, nullable=False)
    max_price = Column(Integer, nullable=False)
    premium_price = Column(Integer, nullable=True)
    confidence_score = Column(Numeric(precision=5, scale=2), nullable=False)
    factors = Column(JSON, nullable=True)
    provider = Column(String(50), default="mock", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    artwork = relationship("Artwork", back_populates="ai_price_predictions")


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    user_id = Column(UUIDType, ForeignKey("users.id"), nullable=False)
    artwork_id = Column(UUIDType, ForeignKey("artworks.id"), nullable=False)
    score = Column(Numeric(precision=5, scale=2), nullable=False)
    reason = Column(String(255), nullable=True)
    recommendation_type = Column(String(50), default="discovery", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="ai_recommendations")
    artwork = relationship("Artwork")


class AIImageJob(Base):
    __tablename__ = "ai_image_jobs"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    artwork_id = Column(UUIDType, ForeignKey("artworks.id"), nullable=False)
    original_image_id = Column(UUIDType, ForeignKey("artwork_images.id"), nullable=True)
    enhanced_image_id = Column(UUIDType, ForeignKey("artwork_images.id"), nullable=True)
    job_type = Column(String(50), nullable=False)
    status = Column(String(30), default="pending", nullable=False)
    input_params = Column(JSON, nullable=True)
    result_url = Column(String(500), nullable=True)
    error_message = Column(Text, nullable=True)
    provider = Column(String(50), default="mock", nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    artwork = relationship("Artwork")
