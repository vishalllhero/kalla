from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class ArtisanDashboardMetrics(BaseModel):
    total_sales: int
    total_earnings: int
    active_listings: int
    pending_orders: int
    artwork_views: int
    verified_artworks: int
    blockchain_certificates: int
    ai_generated_listings: int
    total_artworks: int
    avg_rating: float


class ArtisanSalesDataPoint(BaseModel):
    date: str
    sales: int
    earnings: int
    orders: int


class ArtisanTopArtwork(BaseModel):
    artwork_id: str
    title: str
    price: Optional[int] = None
    views: int
    favorites: int
    sales_count: int
    image_url: Optional[str] = None


class ArtisanDashboardResponse(BaseModel):
    metrics: ArtisanDashboardMetrics
    sales_over_time: List[ArtisanSalesDataPoint]
    top_artworks: List[ArtisanTopArtwork]


class BuyerDashboardMetrics(BaseModel):
    total_orders: int
    total_spent: int
    owned_artworks: int
    active_offers: int
    wishlist_count: int
    certificates: int
    pending_deliveries: int


class OwnedArtworkPreview(BaseModel):
    artwork_id: str
    title: str
    artwork_image_url: Optional[str] = None
    price: Optional[int] = None
    purchase_date: datetime
    certificate_id: Optional[str] = None
    blockchain_status: str


class BuyerDashboardResponse(BaseModel):
    metrics: BuyerDashboardMetrics
    recent_orders: List[dict] = []
    owned_artwork_previews: List[OwnedArtworkPreview] = []


class AdminDashboardMetrics(BaseModel):
    total_users: int
    total_artisans: int
    total_buyers: int
    total_artworks: int
    verified_artworks: int
    total_sales: int
    platform_revenue: int
    pending_verification: int
    pending_orders: int
    b2b_requests: int
    total_certificates: int


class AdminDashboardResponse(BaseModel):
    metrics: AdminDashboardMetrics
    sales_over_time: List[dict] = []
    top_categories: List[dict] = []
    recent_orders: List[dict] = []
