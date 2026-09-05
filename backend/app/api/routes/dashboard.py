from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from ...core.database import get_db
from ...core.config import settings
from ...models.user import User, ArtisanProfile, BuyerProfile
from ...models.artwork import Artwork, Category
from ...models.order import Order, OrderItem, PlatformFee, Wishlist
from ...models.certificate import Certificate
from ...models.b2b_ai import B2BRequest
from ...models.notification import Report, Notification
from ...schemas.dashboard import (
    ArtisanDashboardResponse, ArtisanDashboardMetrics, ArtisanSalesDataPoint, ArtisanTopArtwork,
    BuyerDashboardMetrics, BuyerDashboardResponse, OwnedArtworkPreview,
    AdminDashboardMetrics, AdminDashboardResponse,
)
from ..deps import get_current_active_user
from ...utils import calculate_platform_fee

router = APIRouter()


@router.get("/artisan", response_model=ArtisanDashboardResponse)
async def artisan_dashboard(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get artisan dashboard metrics."""
    if current_user.role.name not in ("artisan", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Artisan access required")

    artisan_profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()

    artworks = db.query(Artwork).filter(Artwork.artisan_id == current_user.id).all()
    orders = db.query(Order).filter(Order.artisan_id == current_user.id).all()

    total_sales = sum(1 for o in orders if o.status == "completed")
    total_earnings = sum(o.artisan_payout for o in orders if o.status == "completed")
    active_listings = sum(1 for a in artworks if a.is_listed and a.status != "sold")
    pending_orders = sum(1 for o in orders if o.status in ("pending", "reserved"))
    verified_artworks = sum(1 for a in artworks if a.is_verified)
    certificates = db.query(Certificate).join(Artwork).filter(Artwork.artisan_id == current_user.id).count()

    sales_over_time: List[ArtisanSalesDataPoint] = []
    for order in sorted(orders, key=lambda x: x.created_at):
        if order.status == "completed":
            sales_over_time.append(ArtisanSalesDataPoint(
                date=order.created_at.strftime("%Y-%m-%d"),
                sales=order.total_amount,
                earnings=order.artisan_payout,
                orders=1,
            ))

    top_artworks: List[ArtisanTopArtwork] = []
    for a in sorted(artworks, key=lambda x: x.view_count, reverse=True)[:5]:
        sales_count = sum(1 for oi in a.order_items if oi.order.status == "completed")
        top_artworks.append(ArtisanTopArtwork(
            artwork_id=a.artwork_id,
            title=a.title,
            price=a.price,
            views=a.view_count,
            favorites=a.favorite_count,
            sales_count=sales_count,
            image_url=a.images[0].url if a.images else None,
        ))

    metrics = ArtisanDashboardMetrics(
        total_sales=total_sales,
        total_earnings=total_earnings,
        active_listings=active_listings,
        pending_orders=pending_orders,
        artwork_views=sum(a.view_count for a in artworks),
        verified_artworks=verified_artworks,
        blockchain_certificates=certificates,
        ai_generated_listings=sum(1 for a in artworks if a.ai_catalog_generated),
        total_artworks=len(artworks),
        avg_rating=artisan_profile.avg_rating if artisan_profile else "0.0",
    )

    return ArtisanDashboardResponse(metrics=metrics, sales_over_time=sales_over_time, top_artworks=top_artworks)


@router.get("/buyer", response_model=BuyerDashboardResponse)
async def buyer_dashboard(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get buyer dashboard metrics."""
    if current_user.role.name not in ("buyer", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Buyer access required")

    orders = db.query(Order).filter(Order.buyer_id == current_user.id).all()

    total_orders = len(orders)
    total_spent = sum(o.total_amount for o in orders if o.payment_status == "paid")
    owned_artworks = db.query(Artwork).filter(Artwork.current_owner_id == current_user.id).count()
    active_offers = db.query(Order).filter(
        Order.buyer_id == current_user.id,
        Order.status == "pending"
    ).count()

    wishlist_count = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).count()

    certificates = db.query(Certificate).join(Artwork).filter(
        Artwork.current_owner_id == current_user.id
    ).count()

    owned = []
    for artwork in db.query(Artwork).filter(Artwork.current_owner_id == current_user.id).all():
        owned.append(OwnedArtworkPreview(
            artwork_id=artwork.artwork_id,
            title=artwork.title,
            artwork_image_url=artwork.images[0].url if artwork.images else None,
            price=artwork.price,
            purchase_date=artwork.updated_at,
            certificate_id=artwork.certificate_id,
            blockchain_status=artwork.blockchain_status,
        ))

    metrics = BuyerDashboardMetrics(
        total_orders=total_orders,
        total_spent=total_spent,
        owned_artworks=owned_artworks,
        active_offers=active_offers,
        wishlist_count=wishlist_count,
        certificates=certificates,
        pending_deliveries=sum(1 for o in orders if o.status in ("pending", "reserved", "shipped")),
    )

    recent_orders = []
    for o in sorted(orders, key=lambda x: x.created_at, reverse=True)[:5]:
        recent_orders.append({
            "id": str(o.id),
            "order_number": o.order_number,
            "total_amount": o.total_amount,
            "status": o.status,
            "payment_status": o.payment_status,
            "created_at": o.created_at.isoformat(),
        })

    return BuyerDashboardResponse(metrics=metrics, recent_orders=recent_orders, owned_artwork_previews=owned)


@router.get("/admin", response_model=AdminDashboardResponse)
async def admin_dashboard(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get admin dashboard metrics."""
    if current_user.role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    total_users = db.query(User).count()
    total_artisans = db.query(User).join(ArtisanProfile).count()
    total_buyers = db.query(User).join(BuyerProfile).count()
    total_artworks = db.query(Artwork).count()
    verified_artworks = db.query(Artwork).filter(Artwork.is_verified == True).count()
    total_sales = db.query(Order).filter(Order.status == "completed").count()

    completed_orders = db.query(Order).filter(Order.status == "completed").all()
    platform_revenue = sum(o.platform_fee for o in completed_orders)

    pending_verification = db.query(ArtisanProfile).filter(ArtisanProfile.verification_status == "pending").count()
    pending_artworks = db.query(Artwork).filter(Artwork.status == "pending_verification").count()
    pending_orders = db.query(Order).filter(Order.status.in_(["pending", "reserved"])).count()
    b2b_requests = db.query(B2BRequest).filter(B2BRequest.status == "open").count()
    total_certificates = db.query(Certificate).count()
    total_reports = db.query(Report).filter(Report.status == "pending").count()

    metrics = AdminDashboardMetrics(
        total_users=total_users,
        total_artisans=total_artisans,
        total_buyers=total_buyers,
        total_artworks=total_artworks,
        verified_artworks=verified_artworks,
        total_sales=total_sales,
        platform_revenue=platform_revenue,
        pending_verification=pending_verification + pending_artworks,
        pending_orders=pending_orders,
        b2b_requests=b2b_requests,
        total_certificates=total_certificates,
    )

    sales_over_time = []
    for o in sorted(completed_orders, key=lambda x: x.created_at):
        sales_over_time.append({
            "date": o.created_at.strftime("%Y-%m-%d"),
            "sales": o.total_amount,
            "revenue": o.platform_fee,
            "orders": 1,
        })

    top_categories = []
    from sqlalchemy import func as sqlfunc
    cat_sales = db.query(
        Category.name, sqlfunc.sum(Order.total_amount).label("total")
    ).join(Artwork, Category.id == Artwork.category_id)\
     .join(OrderItem, Artwork.id == OrderItem.artwork_id)\
     .join(Order, OrderItem.order_id == Order.id)\
     .filter(Order.status == "completed")\
     .group_by(Category.name)\
     .order_by(sqlfunc.sum(Order.total_amount).desc())\
     .limit(10).all()
    for name, total in cat_sales:
        top_categories.append({"category": name, "total_sales": total or 0})

    recent_orders = []
    for o in sorted(completed_orders, key=lambda x: x.created_at, reverse=True)[:10]:
        recent_orders.append({
            "id": str(o.id),
            "order_number": o.order_number,
            "total_amount": o.total_amount,
            "platform_fee": o.platform_fee,
            "artisan_payout": o.artisan_payout,
            "status": o.status,
            "created_at": o.created_at.isoformat(),
        })

    return AdminDashboardResponse(
        metrics=metrics,
        sales_over_time=sales_over_time,
        top_categories=top_categories,
        recent_orders=recent_orders,
    )
