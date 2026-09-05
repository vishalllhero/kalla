from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class OrderItemBase(BaseModel):
    artwork_id: str
    price: int
    quantity: int = 1


class OrderItemRead(OrderItemBase):
    id: str
    order_id: str
    platform_fee_amount: int
    artisan_payout_amount: int
    status: str
    created_at: datetime
    artwork_title: Optional[str] = None
    artwork_image_url: Optional[str] = None
    artisan_name: Optional[str] = None

    model_config = {"from_attributes": True}


class OrderBase(BaseModel):
    buyer_id: str
    artisan_id: str
    total_amount: int
    currency: str = "INR"
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    shipping_address: Optional[dict] = None
    is_b2b: bool = False


class OrderCreate(OrderBase):
    items: List[OrderItemBase]
    platform_fee_percent: float = 5.0


class OrderUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    shipping_status: Optional[str] = None
    tracking_number: Optional[str] = None
    notes: Optional[str] = None


class OrderRead(OrderBase):
    id: str
    order_number: str
    status: str
    platform_fee: int
    artisan_payout: int
    payment_status: str
    shipping_status: str
    tracking_number: Optional[str] = None
    is_negotiable_offer: bool
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    items: List[OrderItemRead] = []
    payments: List["PaymentRead"] = []
    platform_fee_records: List["PlatformFeeRead"] = []
    artisan_payout_records: List["ArtisanPayoutRead"] = []

    model_config = {"from_attributes": True}


class PaymentBase(BaseModel):
    amount: int
    currency: str = "INR"
    payment_method: str
    gateway_response: Optional[dict] = None
    fee_amount: int = 0


class PaymentCreate(PaymentBase):
    pass


class PaymentRead(PaymentBase):
    id: str
    order_id: str
    transaction_id: str
    payment_status: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PlatformFeeRead(BaseModel):
    id: str
    order_id: Optional[str] = None
    amount: int
    currency: str
    percentage: float
    fee_type: str
    description: Optional[str] = None
    transaction_date: datetime

    model_config = {"from_attributes": True}


class ArtisanPayoutRead(BaseModel):
    id: str
    order_id: Optional[str] = None
    artisan_id: str
    amount: int
    currency: str
    order_total: int
    platform_fee: int
    net_payout: int
    payment_status: str
    transaction_id: Optional[str] = None
    created_at: datetime
    processed_at: datetime

    model_config = {"from_attributes": True}


class OfferBase(BaseModel):
    artwork_id: str
    amount: int
    currency: str = "INR"
    message: Optional[str] = None
    expires_at: Optional[datetime] = None


class OfferCreate(OfferBase):
    pass


class OfferRead(OfferBase):
    id: str
    buyer_id: str
    buyer_name: Optional[str] = None
    artwork_title: Optional[str] = None
    artwork_image_url: Optional[str] = None
    price: Optional[int] = None
    status: str
    created_at: datetime
    updated_at: datetime
    responded_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class WishlistCreate(BaseModel):
    artwork_id: str


class WishlistRead(BaseModel):
    id: str
    user_id: str
    artwork_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class CheckoutRequest(BaseModel):
    items: List[str] = Field(..., min_items=1)
    shipping_address: Optional[dict] = None
    payment_method: str = "mock"
    notes: Optional[str] = None


class CheckoutResponse(BaseModel):
    order_id: str
    order_number: str
    total_amount: int
    platform_fee: int
    artisan_payout: int
    payment_status: str
    transaction_id: str


class CheckoutPreviewResponse(BaseModel):
    artwork_id: str
    artwork_title: str
    artwork_image_url: Optional[str] = None
    artisan_name: str
    artisan_region: Optional[str] = None
    artisan_state: Optional[str] = None
    sale_price: int
    currency: str
    platform_fee_percent: float
    platform_fee: int
    artisan_payout: int
    total_amount: int
    shipping_cost: int
    tax_amount: int
    buyer_name: str
    buyer_shipping_address: Optional[dict] = None
    blockchain_network: str
    blockchain_status: str
    is_demo_mode: bool
