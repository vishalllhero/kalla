from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from ...core.database import get_db
from ...core.config import settings
from ...utils import generate_artwork_id, calculate_platform_fee
from ...models.user import User, ArtisanProfile
from ...models.artwork import Artwork, ArtworkImage, ArtworkAttribute, Category
from ...models.certificate import Certificate, BlockchainRecord, ProvenanceEvent, OwnershipTransfer
from ...models.order import Order, OrderItem, Wishlist
from ...schemas.artwork import (
    ArtworkCreate, ArtworkUpdate, ArtworkRead, ArtworkListItem, ArtworkSearchParams,
)
from ...schemas.ai import ImageEnhanceRequest, AICatalogRequest, AIPriceRequest, RecommendationResponse, RecommendationListResponse
from ...schemas.certificate import CertificateRead, ProvenanceEventRead, BlockchainRecordRead, ProvenanceResponse, VerifyResponse
from ...schemas.order import CheckoutResponse
from ..deps import get_current_active_user, get_artisan, get_admin
from ...services.ai import AIServiceFactory
from ...services.blockchain import get_blockchain_service
from ...services.storage.local import LocalStorageService
from ...services.payments import get_payment_service
from ...utils import generate_certificate_id, generate_qr_data

router = APIRouter()


@router.post("/", response_model=ArtworkRead, status_code=status.HTTP_201_CREATED)
async def create_artwork(
    artwork: ArtworkCreate,
    current_user: User = Depends(get_artisan),
    db: Session = Depends(get_db)
):
    """Create a new artwork (artisan only)."""
    if artwork.artisan_id is None:
        pass

    slug_parts = artwork.title.lower().split()
    existing_ids = []
    artwork_id = generate_artwork_id()

    existing = db.query(Artwork).filter(Artwork.artwork_id == artwork_id).first()
    while existing:
        artwork_id = generate_artwork_id()
        existing = db.query(Artwork).filter(Artwork.artwork_id == artwork_id).first()

    db_artwork = Artwork(
        artwork_id=artwork_id,
        title=artwork.title,
        description=artwork.description,
        artisan_id=current_user.id,
        category_id=artwork.category_id,
        craft=artwork.craft,
        material=artwork.material,
        region=artwork.region,
        state=artwork.state,
        creation_year=artwork.creation_year,
        dimensions=artwork.dimensions,
        weight_kg=artwork.weight_kg,
        production_time_days=artwork.production_time_days,
        is_handmade=artwork.is_handmade,
        care_instructions=artwork.care_instructions,
        tags=artwork.tags,
        seo_keywords=artwork.seo_keywords,
        price=artwork.price,
        currency=artwork.currency,
        is_negotiable=artwork.is_negotiable,
        status="draft",
        is_listed=artwork.is_listed,
    )
    db.add(db_artwork)
    db.commit()
    db.refresh(db_artwork)

    if current_user.artisan_profile:
        current_user.artisan_profile.total_listings += 1
        db.commit()

    return _enrich_artwork_read(db, db_artwork)


@router.get("/", response_model=List[ArtworkListItem])
async def list_artworks(
    params: ArtworkSearchParams = Depends(),
    db: Session = Depends(get_db),
):
    """Browse/list artworks with filtering and search."""
    query = db.query(Artwork).options(
        joinedload(Artwork.artisan)
    ).filter(Artwork.status != "draft")

    if params.search:
        ilike = f"%{params.search}%"
        query = query.filter(
            (Artwork.title.ilike(ilike)) |
            (Artwork.description.ilike(ilike)) |
            (Artwork.craft.ilike(ilike)) |
            (Artwork.material.ilike(ilike)) |
            (Artwork.region.ilike(ilike)) |
            (Artwork.tags.ilike(ilike))
        )

    if params.category:
        cat = db.query(Category).filter(Category.slug == params.category).first()
        if cat:
            query = query.filter(Artwork.category_id == cat.id)
        else:
            query = query.filter(Artwork.craft.ilike(f"%{params.category}%"))

    if params.craft:
        query = query.filter(Artwork.craft.ilike(f"%{params.craft}%"))
    if params.region:
        query = query.filter(Artwork.region.ilike(f"%{params.region}%"))
    if params.material:
        query = query.filter(Artwork.material.ilike(f"%{params.material}%"))
    if params.min_price is not None:
        query = query.filter(Artwork.price >= params.min_price)
    if params.max_price is not None:
        query = query.filter(Artwork.price <= params.max_price)
    if params.is_verified is not None:
        query = query.filter(Artwork.is_verified == params.is_verified)
    if params.is_handmade is not None:
        query = query.filter(Artwork.is_handmade == params.is_handmade)
    if params.creation_year is not None:
        query = query.filter(Artwork.creation_year == params.creation_year)
    if params.artisan_id:
        query = query.filter(Artwork.artisan_id == params.artisan_id)
    if params.status:
        query = query.filter(Artwork.status == params.status)

    if params.is_listed is not None and params.is_listed:
        query = query.filter(Artwork.is_listed == True)

    sort_col = getattr(Artwork, params.sort_by, Artwork.created_at)
    if params.sort_order == "desc":
        query = query.order_by(sort_col.desc())
    else:
        query = query.order_by(sort_col.asc())

    offset = (params.page - 1) * params.limit
    items = query.offset(offset).limit(params.limit).all()

    result = []
    for a in items:
        primary_image = db.query(ArtworkImage).filter(
            ArtworkImage.artwork_id == a.id,
            ArtworkImage.is_primary == True
        ).first()

        artisan_name = None
        artisan_region = None
        if a.artisan:
            artisan_name = a.artisan.display_name or a.artisan.full_name
            if a.artisan.artisan_profile:
                artisan_region = a.artisan.artisan_profile.region or a.artisan.artisan_profile.workshop_location

        result.append(ArtworkListItem(
            id=a.id,
            artwork_id=a.artwork_id,
            title=a.title,
            description=a.description,
            price=a.price,
            currency=a.currency,
            craft=a.craft,
            material=a.material,
            region=a.region,
            state=a.state,
            is_verified=a.is_verified,
            is_listed=a.is_listed,
            is_handmade=a.is_handmade,
            creation_year=a.creation_year,
            artisan_name=artisan_name,
            artisan_region=artisan_region,
            image_url=primary_image.url if primary_image else None,
            thumbnail_url=primary_image.thumbnail_url if primary_image else None,
            view_count=a.view_count,
            favorite_count=a.favorite_count,
            blockchain_status=a.blockchain_status,
            tags=a.tags,
            created_at=a.created_at,
        ))

    return result


@router.get("/{artwork_id}", response_model=ArtworkRead)
async def get_artwork(artwork_id: str, db: Session = Depends(get_db)):
    """Get detailed information about a specific artwork."""
    artwork = db.query(Artwork).filter(Artwork.artwork_id == artwork_id).first()
    if not artwork:
        artwork = db.get(Artwork, artwork_id)
    if not artwork:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artwork not found")

    artwork.view_count += 1
    db.commit()

    return _enrich_artwork_read(db, artwork)


@router.put("/{artwork_id}", response_model=ArtworkRead)
async def update_artwork(
    artwork_id: str,
    artwork_update: ArtworkUpdate,
    current_user: User = Depends(get_artisan),
    db: Session = Depends(get_db)
):
    """Update an artwork (artisan/admin only)."""
    artwork = _get_artwork_or_404(db, artwork_id)

    if current_user.role.name != "admin" and artwork.artisan_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own artworks"
        )

    update_data = artwork_update.model_dump(exclude_unset=True) if hasattr(artwork_update, 'model_dump') else artwork_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(artwork, field, value)

    db.commit()
    db.refresh(artwork)

    return _enrich_artwork_read(db, artwork)


@router.delete("/{artwork_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_artwork(
    artwork_id: str,
    current_user: User = Depends(get_artisan),
    db: Session = Depends(get_db)
):
    """Delete an artwork (artisan/admin only)."""
    artwork = _get_artwork_or_404(db, artwork_id)

    if current_user.role.name != "admin" and artwork.artisan_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own artworks"
        )

    if artwork.status == "sold":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a sold artwork"
        )

    artwork.status = "archived"
    db.commit()

    return None


@router.post("/{artwork_id}/upload-image", response_model=ArtworkRead)
async def upload_artwork_image(
    artwork_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_artisan),
    db: Session = Depends(get_db)
):
    """Upload an image for an artwork."""
    artwork = _get_artwork_or_404(db, artwork_id)

    if current_user.role.name != "admin" and artwork.artisan_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    storage = LocalStorageService()
    file_info = storage.save_upload_file(file, subdir="artworks")

    is_primary = False
    if not artwork.images:
        is_primary = True
        artwork.image_enhanced = False

    image = ArtworkImage(
        artwork_id=artwork.id,
        url=file_info["url"],
        thumbnail_url=file_info["thumbnail_url"],
        alt_text=f"Image of {artwork.title}",
        is_primary=is_primary,
        width=1024,
        height=1024,
        file_size_bytes=file_info["size"],
    )
    db.add(image)
    db.commit()
    db.refresh(image)

    return _enrich_artwork_read(db, artwork)


@router.post("/{artwork_id}/enhance", response_model=dict)
async def enhance_artwork_image(
    artwork_id: str,
    request: ImageEnhanceRequest,
    current_user: User = Depends(get_artisan),
    db: Session = Depends(get_db)
):
    """Apply AI image enhancement to an artwork image."""
    artwork = _get_artwork_or_404(db, artwork_id)

    if current_user.role.name != "admin" and artwork.artisan_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    image = db.query(ArtworkImage).filter(ArtworkImage.id == request.image_id).first()
    if not image or image.artwork_id != artwork.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    if not str(image.url).startswith("/uploads"):
        storage = LocalStorageService()
        enhanced_url = storage.get_url(image.url.split("/")[-1], "enhanced")
    else:
        enhanced_url = "/uploads/enhanced/" + image.url.split("/")[-1]

    enhancement_result = await AIServiceFactory.get_image_service().enhance_image(
        image_path=image.url,
        operations=request.operations,
        background_type=getattr(request, "background_type", None),
    )

    from ...models.b2b_ai import AIImageJob
    job = AIImageJob(
        artwork_id=artwork.id,
        original_image_id=image.id,
        job_type="enhance",
        status="completed",
        input_params={"operations": request.operations},
        result_url=enhancement_result.get("enhanced_url", enhanced_url),
        provider="mock",
        started_at=__import__("datetime").datetime.utcnow(),
        completed_at=__import__("datetime").datetime.utcnow(),
    )
    db.add(job)

    enhanced_image = ArtworkImage(
        artwork_id=artwork.id,
        url=enhancement_result.get("enhanced_url", enhanced_url),
        thumbnail_url=enhancement_result.get("thumbnail_url", enhancement_result.get("enhanced_url", enhanced_url)),
        alt_text=f"Enhanced: {image.alt_text or ''}",
        is_primary=False,
        is_enhanced=True,
    )
    db.add(enhanced_image)
    db.commit()

    artwork.image_enhanced = True
    db.commit()

    return {
        "job_id": str(job.id),
        "status": "completed",
        "original_url": image.url,
        "enhanced_url": enhanced_image.url,
        "thumbnail_url": enhanced_image.thumbnail_url,
        "is_enhanced": True,
        "message": enhancement_result.get("message", "Image enhanced successfully"),
    }


@router.post("/{artwork_id}/generate-catalog", response_model=dict)
async def generate_catalog(
    artwork_id: str,
    request: AICatalogRequest,
    current_user: User = Depends(get_artisan),
    db: Session = Depends(get_db)
):
    """AI Generate catalog (title, description, tags, etc.) from text/voice input."""
    artwork = _get_artwork_or_404(db, artwork_id)

    if current_user.role.name != "admin" and artwork.artisan_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    from ...models.b2b_ai import AICatalog
    catalog = await AIServiceFactory.get_catalog_service().generate_catalog(
        text=request.text,
        language=request.language,
        artwork_id=request.artwork_id or artwork_id,
    )

    db_catalog = AICatalog(
        artwork_id=artwork.id,
        input_text=request.text,
        input_language=request.language,
        generated_title=catalog["title"],
        generated_description=catalog["description"],
        generated_category=catalog["category"],
        generated_craft=catalog["craft"],
        generated_material=catalog["material"],
        generated_region=catalog["region"],
        generated_tags=",".join(catalog["tags"]),
        generated_seo_keywords=",".join(catalog["seo_keywords"]),
        generated_care_instructions=catalog["care_instructions"],
        generated_dimensions=catalog.get("dimensions"),
        generated_production_time=catalog.get("production_time_days"),
        confidence_score=catalog["confidence_score"],
        provider=catalog.get("_provider", "mock"),
    )
    db.add(db_catalog)
    db.commit()
    db.refresh(db_catalog)

    artwork.ai_catalog_generated = True
    db.commit()

    return {
        "catalog_id": str(db_catalog.id),
        "confidence_score": catalog["confidence_score"],
        "generated": catalog,
        "is_applied": catalog.get("is_editable", True),
    }


@router.post("/{artwork_id}/apply-catalog", response_model=ArtworkRead)
async def apply_catalog(
    artwork_id: str,
    catalog_id: str,
    current_user: User = Depends(get_artisan),
    db: Session = Depends(get_db)
):
    """Apply an AI-generated catalog to the artwork."""
    artwork = _get_artwork_or_404(db, artwork_id)
    if current_user.role.name != "admin" and artwork.artisan_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    from ...models.b2b_ai import AICatalog
    db_catalog = db.get(AICatalog, catalog_id)
    if not db_catalog or db_catalog.artwork_id != artwork.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catalog not found")

    artwork.title = db_catalog.generated_title
    artwork.description = db_catalog.generated_description
    if db_catalog.generated_craft:
        artwork.craft = db_catalog.generated_craft
    if db_catalog.generated_material:
        artwork.material = db_catalog.generated_material
    if db_catalog.generated_region:
        artwork.region = db_catalog.generated_region
    if db_catalog.generated_care_instructions:
        artwork.care_instructions = db_catalog.generated_care_instructions
    if db_catalog.generated_dimensions:
        artwork.dimensions = db_catalog.generated_dimensions
    if db_catalog.generated_production_time:
        artwork.production_time_days = db_catalog.generated_production_time
    if db_catalog.generated_tags:
        artwork.tags = db_catalog.generated_tags
    if db_catalog.generated_seo_keywords:
        artwork.seo_keywords = db_catalog.generated_seo_keywords
    db_catalog.is_applied = True
    db_catalog.applied_at = __import__("datetime").datetime.utcnow()

    db.commit()
    db.refresh(artwork)

    return _enrich_artwork_read(db, artwork)


@router.post("/{artwork_id}/price-suggestion", response_model=dict)
async def price_suggestion(
    artwork_id: str,
    request: AIPriceRequest,
    current_user: User = Depends(get_artisan),
    db: Session = Depends(get_db)
):
    """Get AI price suggestion for an artwork."""
    artwork = _get_artwork_or_404(db, artwork_id)
    if current_user.role.name != "admin" and artwork.artisan_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    inputs = request.model_dump()
    if not inputs.get("craft_type") and artwork.craft:
        inputs["craft_type"] = artwork.craft
    if not inputs.get("region") and artwork.region:
        inputs["region"] = artwork.region

    result = await AIServiceFactory.get_price_service().suggest_price(inputs)

    from ...models.b2b_ai import AIPricePrediction
    prediction = AIPricePrediction(
        artwork_id=artwork.id,
        inputs=inputs,
        suggested_price=result["suggested_price"],
        min_price=result["min_price"],
        max_price=result["max_price"],
        premium_price=result.get("premium_price"),
        confidence_score=result["confidence_score"],
        factors=result.get("factors", {}),
        provider=result.get("provider", "mock"),
    )
    db.add(prediction)
    db.commit()

    artwork.ai_price_suggested = True
    db.commit()

    return result


@router.post("/{artwork_id}/register-blockchain", response_model=dict)
async def register_blockchain(
    artwork_id: str,
    current_user: User = Depends(get_artisan),
    db: Session = Depends(get_db)
):
    """Register artwork on blockchain and generate digital certificate."""
    artwork = _get_artwork_or_404(db, artwork_id)
    if current_user.role.name != "admin" and artwork.artisan_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    if artwork.blockchain_status == "registered":
        existing_cert = db.query(Certificate).filter(Certificate.artwork_id == artwork.id).first()
        if existing_cert:
            return {
                "certificate_id": existing_cert.certificate_id,
                "blockchain_txn_hash": existing_cert.blockchain_tx_hash,
                "blockchain_network": existing_cert.blockchain_network,
                "certificate_hash": existing_cert.certificate_hash,
                "metadata_hash": existing_cert.metadata_hash,
                "qr_code_url": existing_cert.qr_code_url,
                "metadata_url": existing_cert.metadata_url,
                "status": "already_registered",
            }

    storage = LocalStorageService()
    certificate_id = generate_certificate_id()
    while db.query(Certificate).filter(Certificate.certificate_id == certificate_id).first():
        certificate_id = generate_certificate_id()

    owner_address = f"0x{current_user.id.replace('-', '')[:40]}"
    if len(owner_address) < 42:
        owner_address = owner_address + "0" * (42 - len(owner_address))

    metadata = {
        "artwork_id": artwork.artwork_id,
        "certificate_id": certificate_id,
        "title": artwork.title,
        "description": artwork.description,
        "artisan": current_user.display_name or current_user.email,
        "craft": artwork.craft,
        "material": artwork.material,
        "region": artwork.region,
        "creation_year": artwork.creation_year,
        "price": artwork.price,
        "currency": artwork.currency,
        "image_url": artwork.images[0].url if artwork.images else None,
        "registration_date": __import__("datetime").datetime.utcnow().isoformat(),
    }

    metadata_hash = storage.get_metadata_hash(metadata)
    ipfs_cid = storage.get_ipfs_cid(metadata)

    from ...core.config import settings
    from urllib.parse import urljoin
    metadata_url = urljoin(storage.get_url(certificate_id, "certificates"), "")

    cert_dir = os.path.join(storage.base_path, "certificates", certificate_id)
    os.makedirs(cert_dir, exist_ok=True)
    import json as json_mod
    with open(os.path.join(cert_dir, "metadata.json"), "w") as f:
        json_mod.dump(metadata, f, indent=2, default=str)

    metadata_uri = f"ipfs://{ipfs_cid}"

    blockchain = get_blockchain_service()
    result = await blockchain.register_artwork(
        artwork_id=artwork.artwork_id,
        certificate_id=certificate_id,
        metadata_hash=metadata_hash,
        owner_address=owner_address,
        metadata_uri=metadata_uri,
    )

    qr_data = generate_qr_data(artwork.artwork_id, certificate_id)

    import qrcode
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(qr_data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_path = os.path.join(cert_dir, "qr.png")
    qr_img.save(qr_path)

    certificate = Certificate(
        certificate_id=certificate_id,
        artwork_id=artwork.id,
        artisan_id=current_user.id,
        certificate_hash=metadata_hash,
        metadata_hash=metadata_hash,
        ipfs_cid=ipfs_cid,
        storage_provider=settings.STORAGE_PROVIDER,
        blockchain_network=result.get("network", settings.BLOCKCHAIN_NETWORK),
        blockchain_tx_hash=result["transaction_hash"],
        qr_code_url=qr_data,
        qr_code_data=qr_data,
        metadata_url=metadata_uri,
        issue_date=__import__("datetime").datetime.utcnow(),
        status="active",
    )

    artwork.certificate_id = certificate_id
    artwork.blockchain_status = "registered"
    artwork.blockchain_txn_hash = result["transaction_hash"]
    artwork.blockchain_network = result.get("network", settings.BLOCKCHAIN_NETWORK)
    artwork.status = "verified"
    artwork.is_verified = True
    artwork.verified_at = __import__("datetime").datetime.utcnow()

    db_cert_record = BlockchainRecord(
        artwork_id=artwork.id,
        certificate_id=certificate.id if certificate.id else None,
        transaction_hash=result["transaction_hash"],
        block_number=result.get("block_number"),
        gas_used=result.get("gas_used"),
        network=result.get("network", settings.BLOCKCHAIN_NETWORK),
        contract_address=result.get("contract_address", ""),
        function_name="registerArtwork",
        event_type="ArtworkRegistered",
        status="success",
        timestamp_on_chain=__import__("datetime").datetime.utcnow(),
        tx_data=result,
    )

    provenance = ProvenanceEvent(
        artwork_id=artwork.id,
        event_type="REGISTERED",
        description=f"Artwork registered on blockchain ({result['transaction_hash'][:10]}...)",
        actor_id=current_user.id,
        actor_type="artisan",
        timestamp=__import__("datetime").datetime.utcnow(),
        blockchain_tx_hash=result["transaction_hash"],
        metadata=result,
        is_on_chain=True,
        sequence_order=1,
    )

    db.add(certificate)
    db.add(db_cert_record)
    db.add(provenance)

    if not artwork.provenance_events:
        created_event = ProvenanceEvent(
            artwork_id=artwork.id,
            event_type="CREATED",
            description="Artwork created by artisan",
            actor_id=artwork.artisan_id,
            actor_type="artisan",
            is_on_chain=False,
            sequence_order=0,
        )
        db.add(created_event)
        artwork.provenance_events.append(created_event)

    listed_event = ProvenanceEvent(
        artwork_id=artwork.id,
        event_type="CERTIFIED",
        description=f"Digital certificate issued ({certificate_id})",
        actor_id=current_user.id,
        actor_type="artisan",
        blockchain_tx_hash=result["transaction_hash"],
        is_on_chain=True,
        sequence_order=2,
    )
    db.add(listed_event)

    db.commit()
    db.refresh(artwork)

    return {
        "certificate_id": certificate_id,
        "blockchain_txn_hash": result["transaction_hash"],
        "blockchain_network": result.get("network", settings.BLOCKCHAIN_NETWORK),
        "certificate_hash": metadata_hash,
        "metadata_hash": metadata_hash,
        "ipfs_cid": ipfs_cid,
        "qr_code_url": qr_data,
        "metadata_url": metadata_uri,
        "contract_address": result.get("contract_address"),
        "status": "registered",
        "artwork_id": artwork.artwork_id,
    }


@router.get("/{artwork_id}/provenance", response_model=ProvenanceResponse)
async def get_provenance(artwork_id: str, db: Session = Depends(get_db)):
    """Get provenance timeline for an artwork."""
    artwork = _get_artwork_or_404(db, artwork_id)

    events = db.query(ProvenanceEvent).filter(ProvenanceEvent.artwork_id == artwork.id).order_by(ProvenanceEvent.sequence_order).all()

    current_owner_name = None
    if artwork.current_owner_id:
        owner = db.get(User, artwork.current_owner_id)
        current_owner_name = owner.display_name or owner.full_name or owner.email

    return ProvenanceResponse(
        artwork_id=artwork.artwork_id,
        title=artwork.title,
        current_owner=artwork.current_owner_id,
        current_owner_name=current_owner_name,
        blockchain_status=artwork.blockchain_status,
        certificate_id=artwork.certificate_id,
        events=[ProvenanceEventRead.model_validate(e) for e in events],
    )


@router.get("/{artwork_id}/similar", response_model=List[ArtworkListItem])
async def get_similar_artworks(artwork_id: str, limit: int = 6, db: Session = Depends(get_db)):
    """Get similar artworks based on craft, material, region."""
    artwork = _get_artwork_or_404(db, artwork_id)

    query = db.query(Artwork).filter(
        Artwork.id != artwork.id,
        Artwork.is_listed == True,
        Artwork.is_verified == True,
    )
    if artwork.craft:
        query = query.filter(Artwork.craft == artwork.craft)
    results = query.limit(limit).all()

    if not results and artwork.craft:
        query = db.query(Artwork).filter(
            Artwork.id != artwork.id,
            Artwork.region == artwork.region,
            Artwork.is_listed == True,
            Artwork.is_verified == True,
        )
        results = query.limit(limit).all()

    return [_to_list_item(db, a) for a in results]


def _get_artwork_or_404(db: Session, artwork_id: str) -> Artwork:
    artwork = db.query(Artwork).filter(Artwork.artwork_id == artwork_id).first()
    if not artwork:
        artwork = db.get(Artwork, artwork_id)
    if not artwork:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artwork not found")
    return artwork


def _enrich_artwork_read(db: Session, artwork: Artwork) -> ArtworkRead:
    return ArtworkRead.model_validate(artwork)


def _to_list_item(db: Session, artwork: Artwork) -> ArtworkListItem:
    primary_image = db.query(ArtworkImage).filter(
        ArtworkImage.artwork_id == artwork.id, ArtworkImage.is_primary == True
    ).first()
    artisan_name = None
    artisan_region = None
    if artwork.artisan:
        artisan_name = artwork.artisan.display_name or artwork.artisan.full_name
        if artwork.artisan.artisan_profile:
            artisan_region = artwork.artisan.artisan_profile.region or artwork.artisan.artisan_profile.workshop_location
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


import os
