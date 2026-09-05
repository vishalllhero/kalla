from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ImageEnhanceRequest(BaseModel):
    artwork_id: str
    image_id: str
    operations: List[str] = Field(
        default=["enhance", "background_remove", "lighting_correction", "sharpness"]
    )
    background_type: Optional[str] = None


class ImageEnhanceResponse(BaseModel):
    job_id: str
    status: str
    original_url: str
    enhanced_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    is_enhanced: bool
    message: Optional[str] = None


class AICatalogRequest(BaseModel):
    text: str = Field(..., min_length=1)
    language: str = "en"
    artwork_id: Optional[str] = None


class AICatalogResponse(BaseModel):
    title: str
    description: str
    category: str
    craft: str
    material: str
    region: str
    tags: List[str]
    seo_keywords: List[str]
    care_instructions: str
    dimensions: Optional[str] = None
    production_time_days: Optional[int] = None
    confidence_score: float
    is_editable: bool = True


class AIPriceRequest(BaseModel):
    material_cost: int
    labour_cost: int
    production_time_days: int
    dimensions: Optional[str] = None
    craft_type: Optional[str] = None
    complexity: str = "medium"
    region: Optional[str] = None
    quantity_available: int = 1


class AIPriceResponse(BaseModel):
    suggested_price: int
    min_price: int
    max_price: int
    premium_price: int
    confidence_score: float
    factors: Dict[str, Any]
    explanation: str


class RecommendationResponse(BaseModel):
    artwork_id: str
    title: str
    price: Optional[int] = None
    image_url: Optional[str] = None
    artisan_name: Optional[str] = None
    score: float
    reason: str


class RecommendationListResponse(BaseModel):
    recommendations: List[RecommendationResponse]
    total: int
