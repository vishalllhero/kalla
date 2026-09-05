from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from ...models.artwork import Artwork, Category
from ...models.user import User, ArtisanProfile
from ...schemas.artwork import ArtworkListItem, ArtworkRead
from ...schemas.category import CategoryRead
from ...schemas.artwork import ArtworkListItem

router = APIRouter()


@router.get("/", response_model=List[CategoryRead])
async def list_categories(
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """List all active categories (public)."""
    query = db.query(Category)
    if not include_inactive:
        query = query.filter(Category.is_active == True)
    categories = query.order_by(Category.display_order).all()
    return [CategoryRead.model_validate(c) for c in categories]


@router.get("/{category_id}", response_model=CategoryRead)
async def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get a specific category (public)."""
    cat = db.get(Category, category_id)
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return CategoryRead.model_validate(cat)


@router.get("/{category_slug}/artworks", response_model=List[ArtworkListItem])
async def artworks_by_category(category_slug: str, limit: int = 20, db: Session = Depends(get_db)):
    """Get listed artworks in a category (public)."""
    cat = db.query(Category).filter(Category.slug == category_slug).first()
    if not cat:
        cat = db.query(Category).filter(Category.name == category_slug).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    artworks = db.query(Artwork).filter(
        Artwork.category_id == cat.id,
        Artwork.is_listed == True,
    ).limit(limit).all()

    return [_to_list_item(db, a) for a in artworks]


def _to_list_item(db: Session, artwork: Artwork) -> ArtworkListItem:
    from ...models.artwork import ArtworkImage
    primary_image = db.query(ArtworkImage).filter(
        ArtworkImage.artwork_id == artwork.id, ArtworkImage.is_primary == True
    ).first()
    artisan_name = artwork.artisan.display_name or artwork.artisan.full_name if artwork.artisan else None
    artisan_region = artwork.artisan.artisan_profile.region if artwork.artisan and artwork.artisan.artisan_profile else artwork.region
    return ArtworkListItem(
        id=artwork.id,
        artwork_id=artwork.artwork_id,
        title=artwork.title,
        description=artwork.description,
        price=artwork.price,
        currency=artwork.currency,
        craft=artwork.craft,
        material=artwork.material,
        region=artwork.region,
        state=artwork.state,
        is_verified=artwork.is_verified,
        is_listed=artwork.is_listed,
        is_handmade=artwork.is_handmade,
        creation_year=artwork.creation_year,
        artisan_name=artisan_name,
        artisan_region=artisan_region,
        image_url=primary_image.url if primary_image else None,
        thumbnail_url=primary_image.thumbnail_url if primary_image else None,
        view_count=artwork.view_count,
        favorite_count=artwork.favorite_count,
        blockchain_status=artwork.blockchain_status,
        tags=artwork.tags,
        created_at=artwork.created_at,
    )
