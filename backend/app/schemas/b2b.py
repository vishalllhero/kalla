from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class B2BRequestBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category_id: Optional[int] = None
    craft: Optional[str] = None
    material: Optional[str] = None
    region: Optional[str] = None
    quantity_required: int = Field(..., ge=1)
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    deadline: Optional[datetime] = None
    priority: str = "medium"


class B2BRequestCreate(B2BRequestBase):
    pass


class B2BRequestRead(B2BRequestBase):
    id: str
    buyer_id: str
    buyer_name: Optional[str] = None
    status: str
    matches: List["B2BMatchRead"] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class B2BMatchBase(BaseModel):
    artwork_id: Optional[str] = None
    artisan_id: str
    match_score: float
    match_factors: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class B2BMatchRead(B2BMatchBase):
    id: str
    b2b_request_id: str
    artisan_name: Optional[str] = None
    artwork_title: Optional[str] = None
    artwork_image_url: Optional[str] = None
    is_accepted: bool
    is_rejected: bool
    created_at: datetime
    responded_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class B2BMatchRequest(BaseModel):
    b2b_request_id: Optional[str] = None
    top_n: int = 10


class B2BMatchResponse(BaseModel):
    matches: List[B2BMatchRead]


class B2BRfqItem(BaseModel):
    craft: str
    category_id: Optional[int] = None
    material: Optional[str] = None
    region: Optional[str] = None
    quantity: int
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None


class B2BRfq(BaseModel):
    title: str
    description: Optional[str] = None
    items: List[B2BRfqItem]
    deadline: Optional[datetime] = None
    priority: str = "medium"
