from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session, joinedload
from ...core.database import get_db
from ...core.config import settings
from ...models.artwork import Artwork, ArtworkImage, Category
from ...models.user import User, ArtisanProfile
from ...models.certificate import Certificate, BlockchainRecord, ProvenanceEvent
from ...schemas.certificate import VerifyResponse, ProvenanceResponse, ProvenanceEventRead, CertificateRead
from ...schemas.artwork import ArtworkRead, ArtworkListItem
from ...services.blockchain import get_blockchain_service

router = APIRouter()


@router.get("/{artwork_id}", response_model=VerifyResponse)
async def verify_artwork(artwork_id: str, db: Session = Depends(get_db)):
    """Public QR verification endpoint - verify an artwork by ID."""
    artwork = db.query(Artwork).filter(Artwork.artwork_id == artwork_id).first()
    if not artwork:
        artwork = db.get(Artwork, artwork_id)

    if not artwork:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artwork not found")

    certificate = db.query(Certificate).filter(Certificate.artwork_id == artwork.id).first()
    blockchain = get_blockchain_service()

    blockchain_verify = await blockchain.verify_artwork(artwork.artwork_id)
    blockchain_tx = None
    if certificate and certificate.blockchain_tx_hash:
        blockchain_tx = {
            "transaction_hash": certificate.blockchain_tx_hash,
            "network": certificate.blockchain_network or settings.BLOCKCHAIN_NETWORK,
            "contract_address": blockchain.get_contract_address() if blockchain.is_mock() else "N/A",
        }

    primary_image = db.query(ArtworkImage).filter(
        ArtworkImage.artwork_id == artwork.id, ArtworkImage.is_primary == True
    ).first()

    artisan_name = artwork.artisan.display_name or artwork.artisan.full_name or artwork.artisan.email if artwork.artisan else None
    artisan_region = artwork.artisan.artisan_profile.region if artwork.artisan and artwork.artisan.artisan_profile else artwork.region

    current_owner_name = None
    if artwork.current_owner_id:
        owner = db.get(User, artwork.current_owner_id)
        if owner:
            current_owner_name = "Private Owner"

    events = db.query(ProvenanceEvent).filter(
        ProvenanceEvent.artwork_id == artwork.id
    ).order_by(ProvenanceEvent.sequence_order).all()

    return VerifyResponse(
        is_valid=True,
        artwork_id=artwork.artwork_id,
        title=artwork.title,
        artisan_name=artisan_name,
        region=artisan_region or artwork.region,
        craft=artwork.craft,
        material=artwork.material,
        creation_year=artwork.creation_year,
        description=artwork.description,
        certificate_id=artwork.certificate_id or (certificate.certificate_id if certificate else None),
        certificate_hash=certificate.certificate_hash if certificate else None,
        blockchain_status=artwork.blockchain_status,
        blockchain_network=blockchain_verify.get("network", settings.BLOCKCHAIN_NETWORK),
        blockchain_txn_hash=certificate.blockchain_tx_hash if certificate else None,
        issuance_date=certificate.issue_date if certificate else None,
        current_owner=current_owner_name,
        provenance=[ProvenanceEventRead.model_validate(e) for e in events],
    )


@router.get("/{artwork_id}/certificate", response_model=CertificateRead)
async def get_certificate(artwork_id: str, db: Session = Depends(get_db)):
    """Get the digital certificate for an artwork (public)."""
    artwork = db.query(Artwork).filter(Artwork.artwork_id == artwork_id).first()
    if not artwork:
        artwork = db.get(Artwork, artwork_id)
    if not artwork:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artwork not found")

    certificate = db.query(Certificate).filter(Certificate.artwork_id == artwork.id).first()
    if not certificate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate not found")

    return CertificateRead.model_validate(certificate)


@router.get("/{artwork_id}/provenance", response_model=ProvenanceResponse)
async def get_provenance_public(artwork_id: str, db: Session = Depends(get_db)):
    """Get provenance timeline for an artwork (public)."""
    artwork = db.query(Artwork).filter(Artwork.artwork_id == artwork_id).first()
    if not artwork:
        artwork = db.get(Artwork, artwork_id)
    if not artwork:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artwork not found")

    events = db.query(ProvenanceEvent).filter(
        ProvenanceEvent.artwork_id == artwork.id
    ).order_by(ProvenanceEvent.sequence_order).all()

    current_owner_name = "Private Owner" if artwork.current_owner_id else None

    return ProvenanceResponse(
        artwork_id=artwork.artwork_id,
        title=artwork.title,
        current_owner=artwork.current_owner_id,
        current_owner_name=current_owner_name,
        blockchain_status=artwork.blockchain_status,
        certificate_id=artwork.certificate_id,
        events=[ProvenanceEventRead.model_validate(e) for e in events],
    )


@router.get("/{artwork_id}/qr", response_model=dict)
async def get_qr_code(artwork_id: str, db: Session = Depends(get_db)):
    """Get QR code data for an artwork (public)."""
    artwork = db.query(Artwork).filter(Artwork.artwork_id == artwork_id).first()
    if not artwork:
        artwork = db.get(Artwork, artwork_id)
    if not artwork:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artwork not found")

    from ...utils import generate_qr_data
    base_url = settings.FRONTEND_URL or "https://kalamarket.com"
    qr_data = generate_qr_data(artwork.artwork_id, base_url)

    return {
        "artwork_id": artwork.artwork_id,
        "qr_data": qr_data,
        "qr_url": qr_data,
        "certificate_id": artwork.certificate_id,
        "is_verified": artwork.is_verified,
        "blockchain_status": artwork.blockchain_status,
    }
