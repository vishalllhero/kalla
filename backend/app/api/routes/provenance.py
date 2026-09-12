import hashlib
import json
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from ...core.config import settings
from ...core.database import get_db
from ...models.artwork import Artwork
from ...models.provenance import ProvenanceRecord
from ...models.user import User
from ...schemas.provenance import ProvenanceRecordRead
from ...services.blockchain import get_blockchain_service
from ..deps import get_admin

router = APIRouter()


def _get_artwork(db: Session, artwork_id: str) -> Artwork:
    artwork = db.query(Artwork).options(joinedload(Artwork.artisan)).filter(
        Artwork.artwork_id == artwork_id
    ).first()
    if not artwork:
        artwork = db.get(Artwork, artwork_id)
    if not artwork:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return artwork


def _canonical_metadata(artwork: Artwork) -> dict[str, Any]:
    return {
        "product_id": artwork.artwork_id,
        "title": artwork.title,
        "description": artwork.description,
        "artisan_id": str(artwork.artisan_id),
        "category_id": artwork.category_id,
        "craft": artwork.craft,
        "material": artwork.material,
        "region": artwork.region,
        "state": artwork.state,
        "creation_year": artwork.creation_year,
        "dimensions": artwork.dimensions,
        "weight_kg": artwork.weight_kg,
        "is_handmade": artwork.is_handmade,
        "tags": artwork.tags,
    }


def _metadata_hash(metadata: dict[str, Any]) -> str:
    encoded = json.dumps(metadata, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


@router.post("/products/{artwork_id}/anchor", response_model=ProvenanceRecordRead, status_code=status.HTTP_201_CREATED)
async def anchor_product_provenance(
    artwork_id: str,
    current_user: User = Depends(get_admin),
    db: Session = Depends(get_db),
):
    artwork = _get_artwork(db, artwork_id)
    if not artwork.is_verified:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Product must be verified before anchoring")

    existing = db.query(ProvenanceRecord).filter(ProvenanceRecord.artwork_id == artwork.id).first()
    metadata = _canonical_metadata(artwork)
    metadata_hash = _metadata_hash(metadata)
    if existing:
        if existing.metadata_hash == metadata_hash:
            return existing
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Product metadata changed after anchoring")

    blockchain = get_blockchain_service()
    result = await blockchain.create_provenance_record(
        product_id=artwork.artwork_id,
        artisan_id=str(artwork.artisan_id),
        metadata_hash=metadata_hash,
    )
    now = datetime.utcnow()
    record = ProvenanceRecord(
        artwork_id=artwork.id,
        artisan_id=artwork.artisan_id,
        metadata_hash=metadata_hash,
        blockchain_network=result.get("network", settings.BLOCKCHAIN_NETWORK),
        transaction_signature=result.get("transaction_signature"),
        verification_status="verified" if result.get("status") == "success" else "pending",
        provider_reference={"provider": settings.BLOCKCHAIN_PROVIDER, "metadata": metadata, "result": result},
        verified_at=now if result.get("status") == "success" else None,
    )
    artwork.blockchain_status = "registered" if result.get("status") == "success" else "pending"
    artwork.blockchain_txn_hash = result.get("transaction_signature")
    artwork.blockchain_network = record.blockchain_network
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/products/{artwork_id}", response_model=ProvenanceRecordRead)
async def get_product_provenance(artwork_id: str, db: Session = Depends(get_db)):
    artwork = _get_artwork(db, artwork_id)
    record = db.query(ProvenanceRecord).filter(ProvenanceRecord.artwork_id == artwork.id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provenance record not found")
    return record


@router.get("/verify/{artwork_id}", response_model=dict[str, Any])
async def verify_product_provenance(artwork_id: str, db: Session = Depends(get_db)):
    artwork = _get_artwork(db, artwork_id)
    record = db.query(ProvenanceRecord).filter(ProvenanceRecord.artwork_id == artwork.id).first()
    if not record:
        return {"is_valid": False, "status": "unavailable", "product_id": artwork.artwork_id}

    current_hash = _metadata_hash(_canonical_metadata(artwork))
    provider_result = await get_blockchain_service().verify_provenance(
        product_id=artwork.artwork_id,
        metadata_hash=record.metadata_hash,
        transaction_signature=record.transaction_signature,
    )
    is_valid = current_hash == record.metadata_hash and provider_result.get("is_verified", False)
    return {
        "is_valid": is_valid,
        "status": "verified" if is_valid else "unavailable",
        "product_id": artwork.artwork_id,
        "metadata_hash": record.metadata_hash,
        "blockchain_network": record.blockchain_network,
        "transaction_signature": record.transaction_signature,
        "verified_at": record.verified_at,
    }
