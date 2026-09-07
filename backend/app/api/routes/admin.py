from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ...core.database import get_db
from ...core.config import settings
from ...utils import calculate_platform_fee, generate_artwork_id
from ...models.user import User, ArtisanProfile, BuyerProfile
from ...models.artwork import Artwork, ArtworkAttribute, Category
from ...models.order import Order, OrderItem, PlatformFee
from ...models.certificate import Certificate
from ...models.b2b_ai import B2BRequest
from ...models.notification import Notification
from ...schemas.auth import UserRead
from ...schemas.user import ArtisanProfileRead, BuyerProfileRead, ArtisanProfileCreate, BuyerProfileCreate
from ...schemas.artwork import ArtworkRead, AdminProductCreate, AdminProductUpdate
from ...schemas.category import CategoryRead, CategoryCreate, CategoryUpdate
from ...schemas.dashboard import AdminDashboardMetrics, AdminDashboardResponse
from ..deps import get_current_active_user, get_admin
from ...services.notifications import send_notification_sync

router = APIRouter()


def _product_payload(db: Session, artwork: Artwork) -> dict:
    category = db.get(Category, artwork.category_id) if artwork.category_id else None
    attributes = {
        item.attribute_name: item.attribute_value.split("|")
        for item in artwork.attributes
        if item.attribute_name in {"colors", "sizes", "stock"}
    }
    tags = [tag.strip() for tag in (artwork.tags or "").split(",") if tag.strip()]
    return {
        "id": str(artwork.artwork_id),
        "name": artwork.title,
        "price": artwork.price or 0,
        "category": category.name if category else None,
        "category_id": artwork.category_id,
        "description": artwork.description,
        "image": next((image.url for image in artwork.images if image.is_primary), None),
        "tags": tags,
        "colors": attributes.get("colors", []),
        "sizes": attributes.get("sizes", []),
        "stock": int(attributes.get("stock", ["0"])[0] or 0),
        "featured": artwork.status == "featured",
        "best_seller": artwork.favorite_count > 0,
        "artisan": (
            artwork.artisan.display_name or artwork.artisan.full_name or artwork.artisan.email
            if artwork.artisan else None
        ),
        "artisan_id": str(artwork.artisan_id),
        "status": artwork.status,
        "created_at": artwork.created_at.isoformat() if artwork.created_at else None,
    }


def _save_product_attributes(db: Session, artwork: Artwork, payload: dict) -> None:
    artwork.tags = ",".join(payload.get("tags") or [])
    existing = {attribute.attribute_name: attribute for attribute in artwork.attributes}
    for name in ("colors", "sizes", "stock"):
        if name not in payload:
            continue
        if name == "stock":
            values = str(payload.get("stock", 0))
        else:
            values = "|".join(payload.get(name) or [])
        attribute = existing.get(name)
        if values:
            if attribute:
                attribute.attribute_value = values
            else:
                artwork.attributes.append(
                    ArtworkAttribute(attribute_name=name, attribute_value=values)
                )
        elif attribute:
            db.delete(attribute)


@router.get("/products")
async def list_admin_products(
    search: str = "",
    category_id: int = None,
    status_filter: str = None,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Artwork).order_by(Artwork.created_at.desc())
    if search:
        term = f"%{search}%"
        query = query.filter((Artwork.title.ilike(term)) | (Artwork.description.ilike(term)))
    if category_id is not None:
        query = query.filter(Artwork.category_id == category_id)
    if status_filter:
        query = query.filter(Artwork.status == status_filter)
    products = query.offset(skip).limit(min(limit, 100)).all()
    return [_product_payload(db, product) for product in products]


@router.post("/products", status_code=status.HTTP_201_CREATED)
async def create_admin_product(
    product: AdminProductCreate,
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db),
):
    artisan = db.get(User, product.artisan_id)
    if not artisan or not artisan.artisan_profile:
        raise HTTPException(status_code=400, detail="A valid artisan is required")
    artwork = Artwork(
        artwork_id=generate_artwork_id(),
        title=product.name,
        price=product.price,
        description=product.description,
        category_id=product.category_id,
        artisan_id=artisan.id,
        is_listed=product.status in {"listed", "verified", "featured"},
        is_verified=product.status in {"verified", "featured"},
        status=product.status,
    )
    db.add(artwork)
    db.flush()
    _save_product_attributes(db, artwork, product.model_dump())
    db.commit()
    db.refresh(artwork)
    return _product_payload(db, artwork)


@router.get("/products/{product_id}")
async def get_admin_product(
    product_id: str,
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db),
):
    return _product_payload(db, _get_artwork_or_404(db, product_id))


@router.put("/products/{product_id}")
async def update_admin_product(
    product_id: str,
    product: AdminProductUpdate,
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db),
):
    artwork = _get_artwork_or_404(db, product_id)
    data = product.model_dump(exclude_unset=True)
    if "artisan_id" in data:
        artisan = db.get(User, data["artisan_id"])
        if not artisan or not artisan.artisan_profile:
            raise HTTPException(status_code=400, detail="A valid artisan is required")
        artwork.artisan_id = artisan.id
    field_map = {"name": "title"}
    for key in ("name", "price", "category_id", "description"):
        if key in data:
            setattr(artwork, field_map.get(key, key), data[key])
    if "best_seller" in data:
        artwork.favorite_count = max(1, artwork.favorite_count) if data["best_seller"] else 0
    if "featured" in data:
        artwork.status = "featured" if data["featured"] else (data.get("status") or artwork.status)
    if "status" in data:
        artwork.status = data["status"]
        artwork.is_listed = data["status"] in {"listed", "verified", "featured"}
        artwork.is_verified = data["status"] in {"verified", "featured"}
    _save_product_attributes(db, artwork, data)
    db.commit()
    db.refresh(artwork)
    return _product_payload(db, artwork)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def archive_admin_product(
    product_id: str,
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db),
):
    artwork = _get_artwork_or_404(db, product_id)
    artwork.status = "archived"
    artwork.is_listed = False
    db.commit()


@router.get("/orders")
async def list_admin_orders(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db),
):
    orders = db.query(Order).order_by(Order.created_at.desc()).offset(skip).limit(min(limit, 100)).all()
    return [{
        "id": str(order.id),
        "order_number": order.order_number,
        "total_amount": order.total_amount,
        "status": order.status,
        "payment_status": order.payment_status,
        "created_at": order.created_at.isoformat(),
    } for order in orders]


@router.get("/artisans")
async def list_admin_artisans(
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db),
):
    artisans = db.query(ArtisanProfile).join(User).order_by(ArtisanProfile.created_at.desc()).all()
    return [{
        "id": str(profile.user_id),
        "name": profile.artisan_name or profile.user.display_name or profile.user.email,
        "email": profile.user.email,
        "status": profile.verification_status,
        "total_listings": profile.total_listings,
        "total_sales": profile.total_sales,
    } for profile in artisans]


@router.get("/users", response_model=List[UserRead])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    role_filter: str = None,
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    """List all users (admin only)."""
    from ...models.role import Role
    query = db.query(User).options(__import__("sqlalchemy").orm.joinedload(User.role))
    if role_filter:
        query = query.join(Role).filter(Role.name == role_filter)
    users = query.offset(skip).limit(limit).all()
    return [UserRead.model_validate(u) for u in users]


@router.get("/users/{user_id}", response_model=UserRead)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    """Get a specific user (admin only)."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserRead.model_validate(user)


@router.put("/users/{user_id}/verify", response_model=UserRead)
async def verify_user(
    user_id: str,
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    """Verify a user (admin only)."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_verified = True
    db.commit()
    db.refresh(user)
    return UserRead.model_validate(user)


@router.get("/artisans/pending", response_model=List[ArtisanProfileRead])
async def list_pending_artisans(
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    """List artisans pending verification (admin only)."""
    profiles = db.query(ArtisanProfile).filter(
        ArtisanProfile.verification_status == "pending"
    ).all()
    return [ArtisanProfileRead.model_validate(p) for p in profiles]


@router.post("/artisans/{user_id}/verify", response_model=ArtisanProfileRead)
async def verify_artisan(
    user_id: str,
    approved: bool = True,
    notes: str = None,
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    """Verify an artisan (admin only)."""
    profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artisan profile not found")

    profile.is_verified = approved
    profile.verification_status = "approved" if approved else "rejected"
    profile.verification_notes = notes
    profile.verification_date = datetime.utcnow()
    profile.is_approved_to_sell = approved
    if approved:
        profile.badge_level = "silver"

    user = db.get(User, user_id)
    if user:
        user.is_verified = True

    db.commit()
    db.refresh(profile)
    return ArtisanProfileRead.model_validate(profile)


@router.get("/artworks/pending", response_model=List[ArtworkRead])
async def list_pending_artworks(
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    """List artworks pending verification (admin only)."""
    from ...schemas.artwork import ArtworkRead
    artworks = db.query(Artwork).filter(
        Artwork.status == "pending_verification"
    ).all()
    return [_enrich_artwork_admin(db, a) for a in artworks]


@router.post("/artworks/{artwork_id}/verify", response_model=ArtworkRead)
async def verify_artwork(
    artwork_id: str,
    approved: bool = True,
    notes: str = None,
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    """Verify an artwork (admin only)."""
    from ...schemas.artwork import ArtworkRead
    artwork = _get_artwork_or_404(db, artwork_id)

    if approved:
        artwork.is_verified = True
        artwork.status = "verified"
        artwork.verified_at = datetime.utcnow()
    else:
        artwork.status = "draft"

    db.commit()
    db.refresh(artwork)
    return _enrich_artwork_admin(db, artwork)


@router.get("/categories", response_model=List[CategoryRead])
async def list_categories(
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    """List all categories (admin only)."""
    categories = db.query(Category).order_by(Category.display_order).all()
    return [CategoryRead.model_validate(c) for c in categories]


@router.post("/categories", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(
    category: CategoryCreate,
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    """Create a category (admin only)."""
    existing = db.query(Category).filter(Category.slug == category.slug).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category slug already exists")
    db_category = Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return CategoryRead.model_validate(db_category)


@router.put("/categories/{category_id}", response_model=CategoryRead)
async def update_category(
    category_id: int,
    update: CategoryUpdate,
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    """Update a category (admin only)."""
    cat = db.get(Category, category_id)
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    update_data = update.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        if v is not None:
            setattr(cat, k, v)
    db.commit()
    db.refresh(cat)
    return CategoryRead.model_validate(cat)


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    """Delete a category (admin only)."""
    cat = db.get(Category, category_id)
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    db.delete(cat)
    db.commit()
    return None


@router.put("/artworks/{artwork_id}/status", response_model=ArtworkRead)
async def update_artwork_status(
    artwork_id: str,
    status: str = "verified",
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    """Update artwork status (admin only)."""
    from ...schemas.artwork import ArtworkRead
    artwork = _get_artwork_or_404(db, artwork_id)
    artwork.status = status
    if status == "verified":
        artwork.is_verified = True
        artwork.verified_at = datetime.utcnow()
    db.commit()
    db.refresh(artwork)
    return _enrich_artwork_admin(db, artwork)


@router.get("/revenue", response_model=dict)
async def get_platform_revenue(
    start_date: str = None,
    end_date: str = None,
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    """Get platform revenue breakdown (admin only)."""
    fees = db.query(PlatformFee).all()
    if start_date:
        fees = [f for f in fees if f.transaction_date >= datetime.fromisoformat(start_date)]
    if end_date:
        fees = [f for f in fees if f.transaction_date <= datetime.fromisoformat(end_date)]

    total_revenue = sum(f.amount for f in fees)
    total_orders = db.query(Order).filter(Order.status == "completed").count()
    total_artisans = db.query(User).join(ArtisanProfile).count()

    orders = db.query(Order).filter(Order.status == "completed").all()
    total_gmv = sum(o.total_amount for o in orders)

    return {
        "total_revenue": total_revenue,
        "total_gmv": total_gmv,
        "total_orders": total_orders,
        "total_artisans": total_artisans,
        "platform_fee_percent": settings.PLATFORM_FEE_PERCENT,
        "fee_records": [{"id": str(f.id), "amount": f.amount, "fee_type": f.fee_type, "date": f.transaction_date.isoformat()} for f in fees[:50]],
    }


@router.get("/reports", response_model=List[dict])
async def list_reports(
    status_filter: str = "pending",
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db)
):
    """List reported content (admin only)."""
    from ...models.notification import Report
    reports = db.query(Report).filter(Report.status == status_filter).all()
    return [
        {
            "id": str(r.id),
            "report_type": r.report_type,
            "subject_type": r.subject_type,
            "subject_id": str(r.subject_id) if r.subject_id else None,
            "title": r.title,
            "description": r.description,
            "status": r.status,
            "created_at": r.created_at.isoformat(),
        }
        for r in reports
    ]


@router.get("/notifications", response_model=List[dict])
async def list_notifications(
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db),
    unread_only: bool = False,
):
    """List system notifications (admin only)."""
    query = db.query(Notification).filter(Notification.is_system == True)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    notifs = query.order_by(Notification.created_at.desc()).limit(100).all()
    return [
        {
            "id": str(n.id),
            "title": n.title,
            "message": n.message,
            "notification_type": n.notification_type,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat(),
            "url": n.url,
        }
        for n in notifs
    ]


def _get_artwork_or_404(db: Session, artwork_id: str):
    from ...models.artwork import Artwork
    artwork = db.query(Artwork).filter(Artwork.artwork_id == artwork_id).first()
    if not artwork:
        artwork = db.get(Artwork, artwork_id)
    if not artwork:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artwork not found")
    return artwork


def _enrich_artwork_admin(db: Session, artwork: Artwork):
    from ...schemas.artwork import ArtworkRead
    return ArtworkRead.model_validate(artwork)
