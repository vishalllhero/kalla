from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
from ...core.database import get_db
from ...models.user import User
from ...models.b2b_ai import B2BRequest, B2BMatch
from ...models.notification import Notification
from ...schemas.b2b import B2BRequestCreate, B2BRequestRead, B2BMatchRead, B2BMatchRequest, B2BMatchResponse
from ..deps import get_current_active_user, get_buyer, get_admin, get_artisan
from ...services.ai import AIServiceFactory

router = APIRouter()


@router.post("/requests", response_model=B2BRequestRead, status_code=status.HTTP_201_CREATED)
async def create_b2b_request(
    request: B2BRequestCreate,
    current_user: User = Depends(get_buyer),
    db: Session = Depends(get_db)
):
    """Create a B2B procurement request."""
    db_request = B2BRequest(
        buyer_id=current_user.id,
        title=request.title,
        description=request.description,
        category_id=request.category_id,
        craft=request.craft,
        material=request.material,
        region=request.region,
        quantity_required=request.quantity_required,
        budget_min=request.budget_min,
        budget_max=request.budget_max,
        deadline=request.deadline,
        priority=request.priority,
        status="open",
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)

    return _enrich_b2b_request(db, db_request)


@router.get("/requests", response_model=List[B2BRequestRead])
async def list_b2b_requests(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    status_filter: str = None,
):
    """List B2B requests."""
    if current_user.role.name == "admin":
        query = db.query(B2BRequest)
    elif current_user.role.name == "buyer":
        query = db.query(B2BRequest).filter(B2BRequest.buyer_id == current_user.id)
    else:
        query = db.query(B2BRequest).filter(B2BRequest.status == "open")

    if status_filter:
        query = query.filter(B2BRequest.status == status_filter)

    requests = query.order_by(B2BRequest.created_at.desc()).all()
    return [_enrich_b2b_request(db, r) for r in requests]


@router.get("/requests/{request_id}", response_model=B2BRequestRead)
async def get_b2b_request(request_id: str, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Get a B2B request by ID."""
    req = db.get(B2BRequest, request_id)
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="B2B request not found")
    
    if current_user.role.name != "admin" and req.buyer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    return _enrich_b2b_request(db, req)


@router.post("/requests/{request_id}/match", response_model=dict)
async def match_artisans(
    request_id: str,
    request: B2BMatchRequest = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """AI Match artisans to a B2B request."""
    b2b_req = db.get(B2BRequest, request_id)
    if not b2b_req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="B2B request not found")

    if current_user.role.name != "admin" and b2b_req.buyer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    match_params = {
        "craft": b2b_req.craft,
        "category_id": b2b_req.category_id,
        "material": b2b_req.material,
        "region": b2b_req.region,
        "budget_min": b2b_req.budget_min,
        "budget_max": b2b_req.budget_max,
        "quantity": b2b_req.quantity_required,
    }

    top_n = request.top_n if request else 10

    matches = await AIServiceFactory.get_recommendation_service().get_b2b_matches(match_params, db, limit=top_n)

    for match_data in matches:
        artisan = db.get(User, match_data["artisan_id"])
        if not artisan:
            continue

        existing_match = db.query(B2BMatch).filter(
            B2BMatch.b2b_request_id == b2b_req.id,
            B2BMatch.artisan_id == match_data["artisan_id"]
        ).first()

        if existing_match:
            existing_match.match_score = match_data["match_score"]
            existing_match.match_factors = match_data.get("match_factors", {})
            existing_match.artwork_id = match_data.get("artwork_id")
            existing_match.notes = match_data.get("notes")
        else:
            match = B2BMatch(
                b2b_request_id=b2b_req.id,
                artisan_id=match_data["artisan_id"],
                artwork_id=match_data.get("artwork_id"),
                match_score=match_data["match_score"],
                match_factors=match_data.get("match_factors", {}),
                notes=match_data.get("notes"),
            )
            db.add(match)

    db.commit()
    db.refresh(b2b_req)

    return {
        "request_id": str(b2b_req.id),
        "title": b2b_req.title,
        "matches": matches,
        "total_matches": len(matches),
    }


@router.get("/my-matches", response_model=List[B2BRequestRead])
async def get_my_b2b_matches(
    current_user: User = Depends(get_artisan),
    db: Session = Depends(get_db)
):
    """Get B2B requests where this artisan has been matched."""
    requests = db.query(B2BRequest)\
        .join(B2BMatch, B2BMatch.b2b_request_id == B2BRequest.id)\
        .filter(B2BMatch.artisan_id == current_user.id)\
        .distinct()\
        .order_by(B2BRequest.created_at.desc())\
        .all()
    return [_enrich_b2b_request(db, r) for r in requests]


@router.get("/open-requests", response_model=List[B2BRequestRead])
async def get_open_b2b_requests(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    craft: str = None,
    region: str = None,
):
    """Get open B2B requests, optionally filtered by craft or region (for artisans)."""
    query = db.query(B2BRequest).filter(B2BRequest.status == "open")
    if craft:
        query = query.filter(B2BRequest.craft.ilike(f"%{craft}%"))
    if region:
        query = query.filter(B2BRequest.region.ilike(f"%{region}%"))
    requests = query.order_by(B2BRequest.created_at.desc()).all()
    return [_enrich_b2b_request(db, r) for r in requests]


@router.post("/requests/{request_id}/accept/{artisan_id}", response_model=dict)
async def accept_b2b_match(
    request_id: str,
    artisan_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Accept a B2B match."""
    b2b_req = db.get(B2BRequest, request_id)
    if not b2b_req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="B2B request not found")

    if current_user.role.name != "admin" and b2b_req.buyer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    if b2b_req.status == "closed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request is already closed")

    match = db.query(B2BMatch).filter(
        B2BMatch.b2b_request_id == b2b_req.id,
        B2BMatch.artisan_id == artisan_id
    ).first()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    if match.is_rejected:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This match was already rejected")

    # Accept the selected match
    match.is_accepted = True
    match.responded_at = datetime.utcnow()

    # Reject all other matches for this request
    db.query(B2BMatch).filter(
        B2BMatch.b2b_request_id == b2b_req.id,
        B2BMatch.id != match.id
    ).update({B2BMatch.is_rejected: True})

    # Update B2B request status to closed (accepted)
    b2b_req.status = "closed"
    b2b_req.closed_at = datetime.utcnow()

    db.commit()
    db.refresh(match)
    db.refresh(b2b_req)

    # Create notification for the artisan
    artisan = db.get(User, artisan_id)
    if artisan:
        artisan_notification = Notification(
            recipient_id=artisan_id,
            title="B2B Match Accepted",
            message=f"Your match for '{b2b_req.title}' has been accepted by the buyer.",
            notification_type="b2b_accept",
            related_id=b2b_req.id,
            related_type="b2b_request",
        )
        db.add(artisan_notification)

    # Create notification for the buyer
    buyer_notification = Notification(
        recipient_id=b2b_req.buyer_id,
        title="B2B Match Accepted",
        message=f"You accepted {match.artisan.display_name or 'the artisan'} for your request '{b2b_req.title}'.",
        notification_type="b2b_accept",
        related_id=b2b_req.id,
        related_type="b2b_request",
    )
    db.add(buyer_notification)

    db.commit()

    return {
        "message": "Match accepted",
        "artisan_id": artisan_id,
        "artisan_name": match.artisan.display_name or match.artisan.full_name if match.artisan else "Unknown",
        "match_score": float(match.match_score),
        "artwork_id": str(match.artwork_id) if match.artwork_id else None,
        "artwork_title": match.artwork.title if match.artwork else None,
        "status": "accepted",
        "request_status": "closed",
    }


def _enrich_b2b_request(db: Session, req: B2BRequest) -> B2BRequestRead:
    buyer_name = None
    if req.buyer:
        buyer_name = req.buyer.display_name or req.buyer.full_name

    enriched_matches = []
    for match in req.matches:
        artisan_name = match.artisan.display_name or match.artisan.full_name if match.artisan else None
        artwork_title = match.artwork.title if match.artwork else None
        artwork_image_url = None
        if match.artwork and match.artwork.images:
            artwork_image_url = match.artwork.images[0].url

        match_dict = {
            "id": str(match.id),
            "b2b_request_id": str(match.b2b_request_id),
            "artwork_id": str(match.artwork_id) if match.artwork_id else None,
            "artisan_id": str(match.artisan_id),
            "match_score": float(match.match_score),
            "match_factors": match.match_factors,
            "notes": match.notes,
            "artisan_name": artisan_name,
            "artwork_title": artwork_title,
            "artwork_image_url": artwork_image_url,
            "is_accepted": match.is_accepted,
            "is_rejected": match.is_rejected,
            "created_at": match.created_at,
            "responded_at": match.responded_at,
        }
        enriched_matches.append(B2BMatchRead.model_validate(match_dict))

    return B2BRequestRead(
        id=str(req.id),
        buyer_id=str(req.buyer_id),
        buyer_name=buyer_name,
        title=req.title,
        description=req.description,
        category_id=req.category_id,
        craft=req.craft,
        material=req.material,
        region=req.region,
        quantity_required=req.quantity_required,
        budget_min=req.budget_min,
        budget_max=req.budget_max,
        deadline=req.deadline,
        status=req.status,
        priority=req.priority,
        matches=enriched_matches,
        created_at=req.created_at,
        updated_at=req.updated_at,
    )
