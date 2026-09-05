import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


from .category import CategoryBase, CategoryCreate, CategoryUpdate, CategoryRead


class ArtisanProfileBase(BaseModel):
    artisan_name: Optional[str] = None
    bio: Optional[str] = None
    craft_experience_years: int = 0
    workshop_location: Optional[str] = None
    region: Optional[str] = None
    state: Optional[str] = None
    instagram_handle: Optional[str] = None
    website_url: Optional[str] = None
    id_proof_type: Optional[str] = None
    id_proof_url: Optional[str] = None


class ArtisanProfileCreate(ArtisanProfileBase):
    pass


class ArtisanProfileRead(ArtisanProfileBase):
    id: str
    user_id: str
    artisan_id: str
    is_verified: bool
    verification_status: str
    badge_level: str
    total_sales: int
    total_listings: int
    avg_rating: str
    is_featured: bool
    is_approved_to_sell: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class BuyerProfileBase(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: str = "India"
    is_business: bool = False
    company_name: Optional[str] = None
    gst_number: Optional[str] = None
    preferred_currency: str = "INR"


class BuyerProfileCreate(BuyerProfileBase):
    pass


class BuyerProfileRead(BuyerProfileBase):
    id: str
    user_id: str
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AdminProfileRead(BaseModel):
    id: str
    user_id: str
    admin_level: str
    can_manage_users: bool
    can_verify_artisans: bool
    can_verify_artworks: bool
    can_manage_categories: bool
    created_at: datetime

    model_config = {"from_attributes": True}
