import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from .category import CategoryRead


class ArtworkImageBase(BaseModel):
    url: str = Field(..., max_length=500)
    thumbnail_url: Optional[str] = None
    alt_text: Optional[str] = None
    is_primary: bool = False
    is_enhanced: bool = False
    sort_order: int = 0
    width: Optional[int] = None
    height: Optional[int] = None
    file_size_bytes: Optional[int] = None


class ArtworkImageRead(ArtworkImageBase):
    id: str
    artwork_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ArtworkAttributeRead(BaseModel):
    id: str
    artwork_id: str
    attribute_name: str
    attribute_value: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ArtworkAttributeBase(BaseModel):
    attribute_name: str = Field(..., max_length=100)
    attribute_value: str = Field(..., max_length=255)


class ArtworkBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category_id: Optional[int] = None
    craft: Optional[str] = None
    material: Optional[str] = None
    region: Optional[str] = None
    state: Optional[str] = None
    creation_year: Optional[int] = None
    dimensions: Optional[str] = None
    weight_kg: Optional[str] = None
    production_time_days: int = 0
    is_handmade: bool = True
    care_instructions: Optional[str] = None
    tags: Optional[str] = None
    seo_keywords: Optional[str] = None
    price: Optional[int] = None
    currency: str = "INR"
    is_negotiable: bool = True
    is_listed: bool = False
    status: str = "draft"


class ArtworkCreate(ArtworkBase):
    pass


class ArtworkUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    craft: Optional[str] = None
    material: Optional[str] = None
    region: Optional[str] = None
    state: Optional[str] = None
    creation_year: Optional[int] = None
    dimensions: Optional[str] = None
    weight_kg: Optional[str] = None
    production_time_days: Optional[int] = None
    is_handmade: Optional[bool] = None
    care_instructions: Optional[str] = None
    tags: Optional[str] = None
    seo_keywords: Optional[str] = None
    price: Optional[int] = None
    currency: Optional[str] = None
    is_negotiable: Optional[bool] = None
    is_listed: Optional[bool] = None
    status: Optional[str] = None
    is_verified: Optional[bool] = None

    model_config = {"extra": "ignore"}


class ArtworkRead(ArtworkBase):
    id: str
    artwork_id: str
    artisan_id: str
    artisan_name: Optional[str] = None
    artisan_avatar_url: Optional[str] = None
    artisan_region: Optional[str] = None
    artisan_state: Optional[str] = None
    is_verified: bool
    view_count: int
    favorite_count: int
    certificate_id: Optional[str] = None
    blockchain_status: str
    blockchain_txn_hash: Optional[str] = None
    blockchain_network: Optional[str] = None
    current_owner_id: Optional[str] = None
    ai_catalog_generated: bool
    ai_price_suggested: bool
    image_enhanced: bool
    verified_at: Optional[datetime] = None
    listed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    images: List[ArtworkImageRead] = []
    attributes: List[ArtworkAttributeRead] = []
    category: Optional[CategoryRead] = None

    model_config = {"from_attributes": True}


class ArtworkListItem(BaseModel):
    id: str
    artwork_id: str
    title: str
    description: Optional[str] = None
    price: Optional[int] = None
    currency: str
    craft: Optional[str] = None
    material: Optional[str] = None
    region: Optional[str] = None
    state: Optional[str] = None
    is_verified: bool
    is_listed: bool
    is_handmade: bool
    creation_year: Optional[int] = None
    artisan_name: Optional[str] = None
    artisan_region: Optional[str] = None
    image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    view_count: int
    favorite_count: int
    blockchain_status: str
    tags: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ArtworkSearchParams(BaseModel):
    search: Optional[str] = None
    category: Optional[str] = None
    craft: Optional[str] = None
    region: Optional[str] = None
    material: Optional[str] = None
    min_price: Optional[int] = None
    max_price: Optional[int] = None
    is_verified: Optional[bool] = None
    is_handmade: Optional[bool] = None
    creation_year: Optional[int] = None
    artisan_id: Optional[str] = None
    status: Optional[str] = None
    is_listed: Optional[bool] = None
    page: int = 1
    limit: int = 20
    sort_by: str = "created_at"
    sort_order: str = "desc"
