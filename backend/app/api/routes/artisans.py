from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from ...core.database import get_db
from ...models.artwork import Artwork, ArtworkImage
from ...models.user import ArtisanProfile, User
from ...schemas.user import ArtisanProfileRead

router = APIRouter()


@router.get("/", response_model=list[ArtisanProfileRead])
async def list_artisans(
    state: Optional[str] = None,
    craft: Optional[str] = None,
    verified_only: bool = True,
    db: Session = Depends(get_db),
):
    query = db.query(ArtisanProfile).options(joinedload(ArtisanProfile.user)).join(User)
    if verified_only:
        query = query.filter(ArtisanProfile.is_verified.is_(True))
    if state:
        query = query.filter(ArtisanProfile.state.ilike(f"%{state}%"))
    if craft:
        query = query.join(Artwork, Artwork.artisan_id == ArtisanProfile.user_id).filter(Artwork.craft.ilike(f"%{craft}%"))
    return query.order_by(ArtisanProfile.is_featured.desc(), ArtisanProfile.created_at.desc()).distinct().all()


@router.get("/{artisan_id}")
async def get_artisan(artisan_id: str, db: Session = Depends(get_db)):
    profile = db.query(ArtisanProfile).options(joinedload(ArtisanProfile.user)).filter(
        (ArtisanProfile.artisan_id == artisan_id) | (ArtisanProfile.user_id == artisan_id)
    ).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artisan not found")

    artworks = db.query(Artwork).options(joinedload(Artwork.images)).filter(
        Artwork.artisan_id == profile.user_id,
        Artwork.is_listed.is_(True),
    ).order_by(Artwork.created_at.desc()).all()
    return {
        "artisan": ArtisanProfileRead.model_validate(profile),
        "artworks": [
            {
                "artwork_id": artwork.artwork_id,
                "title": artwork.title,
                "price": artwork.price,
                "craft": artwork.craft,
                "region": artwork.region,
                "verified": artwork.is_verified,
                "image_url": next((image.url for image in artwork.images if image.is_primary), None),
            }
            for artwork in artworks
        ],
    }
