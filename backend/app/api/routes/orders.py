from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func as sqlfunc
from typing import List
from ...core.database import get_db
from ...core.config import settings
from ...utils import (
    generate_order_number, generate_transaction_id, calculate_platform_fee
)
from ...models.user import User, ArtisanProfile, BuyerProfile
from ...models.artwork import Artwork, ArtworkImage
from ...models.order import Order, OrderItem, Payment, PlatformFee, ArtisanPayout, Offer, Wishlist
from ...models.certificate import Certificate, ProvenanceEvent, OwnershipTransfer
from ...models.role import Role
from ...schemas.order import (
    OrderCreate, OrderRead, OrderUpdate, CheckoutRequest, CheckoutResponse,
    CheckoutPreviewResponse, OrderItemRead, PaymentRead, PlatformFeeRead,
    ArtisanPayoutRead, OfferCreate, OfferRead, WishlistCreate, WishlistRead
)
from ..deps import get_current_active_user, get_artisan, get_buyer, get_admin
from ...services.payments import get_payment_service
from ...services.blockchain import get_blockchain_service
from ...services.notifications import send_notification_sync

import logging
logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/checkout/preview", response_model=CheckoutPreviewResponse)
async def checkout_preview(
    artwork_id: str,
    current_user: User = Depends(get_buyer),
    db: Session = Depends(get_db)
):
    """Preview checkout details: fee calculation and buyer info before purchase."""
    artwork = _get_artwork_by_id_or_404(db, artwork_id)

    if artwork.status == "sold":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Artwork is no longer available (sold)")
    if artwork.status == "reserved":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Artwork is temporarily reserved")
    if not artwork.is_listed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Artwork is not listed for sale")
    if artwork.artisan_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot purchase your own artwork")

    buyer_profile = db.query(BuyerProfile).filter(BuyerProfile.user_id == current_user.id).first()

    fee_info = calculate_platform_fee(artwork.price or 0, settings.PLATFORM_FEE_PERCENT)

    artisan = db.get(User, artwork.artisan_id)
    artisan_profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == artwork.artisan_id).first()

    primary_image = db.query(ArtworkImage).filter(
        ArtworkImage.artwork_id == artwork.id, ArtworkImage.is_primary == True
    ).first()

    return CheckoutPreviewResponse(
        artwork_id=artwork.artwork_id,
        artwork_title=artwork.title,
        artwork_image_url=primary_image.url if primary_image else None,
        artisan_name=artisan.display_name or artisan.full_name or "Unknown Artisan",
        artisan_region=artisan_profile.region if artisan_profile else artwork.region,
        artisan_state=artisan_profile.state if artisan_profile else artwork.state,
        sale_price=artwork.price or 0,
        currency=artwork.currency,
        platform_fee_percent=float(settings.PLATFORM_FEE_PERCENT),
        platform_fee=fee_info["platform_fee"],
        artisan_payout=fee_info["artisan_payout"],
        total_amount=fee_info["total_amount"],
        shipping_cost=0,
        tax_amount=0,
        buyer_name=buyer_profile.full_name or current_user.display_name or current_user.email if buyer_profile else (current_user.display_name or current_user.email),
        buyer_shipping_address={
            "city": buyer_profile.city or "",
            "state": buyer_profile.state or "",
            "country": buyer_profile.country or "",
        } if buyer_profile else None,
        blockchain_network=artwork.blockchain_network or settings.BLOCKCHAIN_NETWORK,
        blockchain_status=artwork.blockchain_status,
        is_demo_mode=True,
    )


@router.post("/checkout", response_model=CheckoutResponse)
async def checkout(
    request: CheckoutRequest,
    current_user: User = Depends(get_buyer),
    db: Session = Depends(get_db)
):
    """Checkout - create an order with items, process payment, transfer ownership.

    Critical business logic:
    1. Lock artwork rows with SELECT FOR UPDATE (prevents double-purchase race)
    2. Verify: artwork exists, is listed, is not sold/reserved
    3. Prevent artisan from buying their own artwork (403)
    4. Reserve artwork (status -> reserved)
    5. Create order
    6. Process mock payment
    7. Calculate platform fee (5% / configurable)
    8. Calculate artisan payout
    9. Transfer ownership (artwork.current_owner_id -> buyer)
    10. Add provenance events (SOLD, OWNERSHIP_TRANSFERRED)
    11. Update certificate
    12. Mark artwork SOLD (atomic with payment)
    13. Notify buyer, artisan, and admin
    14. If any step fails, rollback entire transaction
    """
    if not request.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No items provided")

    buyer_profile = db.query(BuyerProfile).filter(BuyerProfile.user_id == current_user.id).first()

    # ── Phase 1: Validate + lock all artwork rows atomically ──
    # Use SELECT ... FOR UPDATE to prevent concurrent double-purchase.
    # SQLite (dev) ignores the hint but still runs in a transaction; PostgreSQL
    # provides true row-level locking.
    artworks: list[Artwork] = []
    total_amount = 0
    order_items_data = []

    try:
        for artwork_id_str in request.items:
            artwork = _get_artwork_by_id_or_404(db, artwork_id_str)
            # Re-query with row lock to prevent race conditions
            artwork = db.query(Artwork).filter(Artwork.id == artwork.id).with_for_update().first()

            if artwork.status == "sold":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Artwork {artwork.artwork_id} is no longer available (sold)"
                )
            if artwork.status == "reserved":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Artwork {artwork.artwork_id} is temporarily reserved by another buyer"
                )
            if not artwork.is_listed:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Artwork {artwork.artwork_id} is not listed"
                )
            # Prevent artisan from purchasing their own artwork
            if artwork.artisan_id == current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"You cannot purchase your own artwork"
                )

            artwork.status = "reserved"
            db.add(artwork)

            item_price = artwork.price or 0
            total_amount += item_price
            order_items_data.append({
                "artwork_id": artwork.id,
                "price": item_price,
                "quantity": 1,
            })
            artworks.append(artwork)

        # Flush reservation before proceeding
        db.flush()

        # ── Phase 2: Fee calculation ──
        fee_info = calculate_platform_fee(total_amount, settings.PLATFORM_FEE_PERCENT)
        platform_fee_amount = fee_info["platform_fee"]
        artisan_payout_amount = fee_info["artisan_payout"]

        # ── Phase 3: Shipping address ──
        shipping_address = request.shipping_address or {}
        if buyer_profile and not request.shipping_address:
            shipping_address = {
                "name": buyer_profile.full_name or "",
                "address_line1": buyer_profile.address_line1 or "",
                "address_line2": buyer_profile.address_line2 or "",
                "city": buyer_profile.city or "",
                "state": buyer_profile.state or "",
                "pincode": buyer_profile.pincode or "",
                "country": buyer_profile.country or "",
                "is_business": buyer_profile.is_business or False,
            }

        artisan_id = artworks[0].artisan_id

        # ── Phase 4: Create order ──
        order_number = generate_order_number()
        while db.query(Order).filter(Order.order_number == order_number).first():
            order_number = generate_order_number()

        order = Order(
            order_number=order_number,
            buyer_id=current_user.id,
            artisan_id=artisan_id,
            total_amount=total_amount,
            currency="INR",
            platform_fee=platform_fee_amount,
            artisan_payout=artisan_payout_amount,
            payment_method=request.payment_method or "mock",
            shipping_address=shipping_address,
            notes=request.notes,
            is_b2b=False,
            status="pending_payment",
            payment_status="pending",
        )
        db.add(order)
        db.flush()
        db.refresh(order)

        # ── Phase 5: Create order items ──
        for item_data in order_items_data:
            item = OrderItem(
                order_id=order.id,
                artwork_id=item_data["artwork_id"],
                price=item_data["price"],
                quantity=item_data["quantity"],
                platform_fee_amount=platform_fee_amount // len(order_items_data),
                artisan_payout_amount=artisan_payout_amount // len(order_items_data),
                status="pending",
            )
            db.add(item)
        db.flush()

        # ── Phase 6: Process payment (mock) ──
        payment_service = get_payment_service()
        payment_result = await payment_service.process_payment(
            amount=total_amount,
            currency="INR",
            payment_method=request.payment_method or "mock",
            order_id=str(order.id),
            buyer_id=str(current_user.id),
            metadata={"order_number": order_number, "artisan_id": str(artisan_id)},
        )

        if payment_result.get("status") != "completed":
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Payment failed. Please try another payment method."
            )

        payment = Payment(
            order_id=order.id,
            transaction_id=payment_result["transaction_id"],
            amount=payment_result["amount"],
            currency=payment_result["currency"],
            payment_method=payment_result["payment_method"],
            payment_status=payment_result["status"],
            gateway_response=payment_result.get("gateway_response", {}),
            fee_amount=0,
        )
        db.add(payment)

        # ── Phase 7: Platform fee record ──
        pf_record = PlatformFee(
            order_id=order.id,
            amount=platform_fee_amount,
            currency="INR",
            percentage=settings.PLATFORM_FEE_PERCENT,
            fee_type="primary_sale",
            description=f"KALAA {settings.PLATFORM_FEE_PERCENT}% platform fee",
        )
        db.add(pf_record)

        # ── Phase 8: Artisan payout record ──
        artisan = db.get(User, artisan_id)
        artisan_profile = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == artisan_id).first()
        if artisan_profile:
            artisan_profile.total_sales += 1
            db.add(artisan_profile)

        payout = ArtisanPayout(
            order_id=order.id,
            artisan_id=artisan_id,
            amount=artisan_payout_amount,
            currency="INR",
            order_total=total_amount,
            platform_fee=platform_fee_amount,
            net_payout=artisan_payout_amount,
            payment_status="completed",
            transaction_id=payment_result["transaction_id"],
        )
        db.add(payout)

        # ── Phase 9: Ownership transfer + provenance + certificate ──
        from datetime import datetime as _dt
        now = _dt.utcnow()

        blockchain = get_blockchain_service()

        for artwork in artworks:
            old_owner = artwork.current_owner_id or artwork.artisan_id
            artwork.current_owner_id = current_user.id
            artwork.status = "sold"
            artwork.is_listed = False
            artwork.sold_at = now
            db.add(artwork)

            # Build blockchain-compatible addresses
            owner_addr = f"0x{current_user.id.replace('-', '')[:40]}"
            if len(owner_addr) < 42:
                owner_addr = owner_addr + "0" * (42 - len(owner_addr))
            prev_owner_addr = f"0x{str(old_owner).replace('-', '')[:40]}"
            if len(prev_owner_addr) < 42:
                prev_owner_addr = prev_owner_addr + "0" * (42 - len(prev_owner_addr))

            # Blockchain transfer (may fail — handle gracefully with pending state)
            blockchain_tx_hash = None
            try:
                tx_result = await blockchain.transfer_artwork(
                    artwork_id=artwork.artwork_id,
                    from_address=prev_owner_addr,
                    to_address=owner_addr,
                    order_id=str(order.id),
                )
                blockchain_tx_hash = tx_result.get("transaction_hash")
            except Exception as e:
                logger.warning(f"Blockchain transfer failed for {artwork.artwork_id}: {e}")

            # Update certificate
            if artwork.certificate_id:
                cert = db.query(Certificate).filter(
                    Certificate.certificate_id == artwork.certificate_id
                ).first()
                if cert:
                    cert.status = "transferred"
                    cert.blockchain_tx_hash = blockchain_tx_hash
                    db.add(cert)

            # Provenance events
            max_seq = db.query(
                sqlfunc.max(ProvenanceEvent.sequence_order)
            ).filter(ProvenanceEvent.artwork_id == artwork.id).scalar()
            next_order = (max_seq + 1) if max_seq else 1

            # Add LISTED event if it doesn't exist (for artworks that went straight to sold)
            has_listed = db.query(ProvenanceEvent).filter(
                ProvenanceEvent.artwork_id == artwork.id,
                ProvenanceEvent.event_type == "LISTED"
            ).first()
            if not has_listed:
                db.add(ProvenanceEvent(
                    artwork_id=artwork.id,
                    event_type="LISTED",
                    description="Artwork listed on KALAA marketplace",
                    actor_id=artwork.artisan_id,
                    actor_type="artisan",
                    is_on_chain=False,
                    sequence_order=next_order - 1 if max_seq and max_seq > 0 else 3,
                ))

            sold_event = ProvenanceEvent(
                artwork_id=artwork.id,
                event_type="SOLD",
                description=f"Artwork sold to {current_user.display_name or current_user.email}",
                actor_id=current_user.id,
                actor_type="buyer",
                blockchain_tx_hash=blockchain_tx_hash,
                is_on_chain=bool(blockchain_tx_hash),
                sequence_order=next_order,
            )
            transfer_event = ProvenanceEvent(
                artwork_id=artwork.id,
                event_type="OWNERSHIP_TRANSFERRED",
                description=f"Ownership transferred from {artisan.display_name or 'Artisan'} to {current_user.display_name or 'Buyer'}",
                actor_id=current_user.id,
                actor_type="buyer",
                blockchain_tx_hash=blockchain_tx_hash,
                is_on_chain=bool(blockchain_tx_hash),
                sequence_order=next_order + 1,
            )
            ownership_transfer = OwnershipTransfer(
                artwork_id=artwork.id,
                from_owner_id=old_owner,
                to_owner_id=current_user.id,
                transfer_type="sale",
                transaction_hash=blockchain_tx_hash,
                order_id=order.id,
            )
            db.add_all([sold_event, transfer_event, ownership_transfer])

        # ── Phase 10: Finalize order ──
        order.status = "paid"
        order.payment_status = "paid"
        order.completed_at = now
        db.add(order)

        db.commit()
        db.refresh(order)

        # ── Phase 11: Notifications (after commit so IDs are stable) ──
        buyer_name = current_user.display_name or current_user.email
        artisan_name = artisan.display_name or artisan.full_name or "the artisan"

        send_notification_sync(
            db=db,
            user_id=current_user.id,
            title="Purchase Successful",
            message=f"Your purchase of '{artworks[0].title}' was successful. Order #{order_number}. Transaction: {payment_result['transaction_id']}",
            notification_type="purchase_completed",
            related_id=order.id,
            related_type="order",
            url=f"/orders/{order.id}",
        )
        send_notification_sync(
            db=db,
            user_id=artisan_id,
            title="Your Artwork Has Been Sold",
            message=f"{artworks[0].title} was purchased by {buyer_name}. Order #{order_number}.",
            notification_type="artwork_sold",
            related_id=order.id,
            related_type="order",
            url=f"/artisan/orders",
        )
        # Admin notification
        admin_users = db.query(User).filter(User.role.has(name="admin")).all()
        for admin in admin_users:
            send_notification_sync(
                db=db,
                user_id=admin.id,
                title="New Marketplace Transaction",
                message=f"New sale: {artworks[0].title} sold for ₹{total_amount}. Fee: ₹{platform_fee_amount}, Payout: ₹{artisan_payout_amount}.",
                notification_type="admin_transaction",
                related_id=order.id,
                related_type="order",
                is_system=True,
            )
        # Ownership transfer notification to buyer
        send_notification_sync(
            db=db,
            user_id=current_user.id,
            title="Digital Ownership Transferred",
            message=f"Digital ownership of '{artworks[0].title}' has been transferred to your KALAA collection.",
            notification_type="ownership_transferred",
            related_id=order.id,
            related_type="order",
            url=f"/orders/{order.id}/certificate",
        )
        db.commit()

        return CheckoutResponse(
            order_id=str(order.id),
            order_number=order_number,
            total_amount=total_amount,
            platform_fee=platform_fee_amount,
            artisan_payout=artisan_payout_amount,
            payment_status=order.payment_status,
            transaction_id=payment_result["transaction_id"],
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Checkout failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Purchase could not be completed. Please try again."
        ) from e


@router.post("/orders/{order_id}/cancel", response_model=OrderRead)
async def cancel_order(
    order_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cancel an order."""
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.buyer_id != current_user.id and current_user.role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    if order.status not in ("pending", "pending_payment", "reserved"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order cannot be cancelled at this stage")

    order.status = "cancelled"
    db.commit()
    db.refresh(order)
    return _enrich_order_read(db, order)


@router.get("/orders", response_model=List[OrderRead])
async def list_orders(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    role: str = None,
):
    """List orders for the current user (or all orders for admin)."""
    user_role = current_user.role.name

    if role is None or role == "buyer":
        if user_role == "buyer" or user_role == "admin":
            orders = db.query(Order).filter(Order.buyer_id == current_user.id).order_by(Order.created_at.desc()).all()
        elif user_role == "artisan":
            orders = db.query(Order).filter(Order.artisan_id == current_user.id).order_by(Order.created_at.desc()).all()
        else:
            orders = []
    elif role == "artisan":
        if user_role == "artisan" or user_role == "admin":
            orders = db.query(Order).filter(Order.artisan_id == current_user.id).order_by(Order.created_at.desc()).all()
        elif user_role == "buyer":
            orders = db.query(Order).filter(Order.buyer_id == current_user.id).order_by(Order.created_at.desc()).all()
        else:
            orders = []
    else:
        if user_role == "admin":
            orders = db.query(Order).order_by(Order.created_at.desc()).all()
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required for listing all orders")

    return [_enrich_order_read(db, o) for o in orders]


@router.get("/orders/{order_id}", response_model=OrderRead)
async def get_order(order_id: str, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Get detailed order information."""
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.buyer_id != current_user.id and order.artisan_id != current_user.id and current_user.role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return _enrich_order_read(db, order)


@router.get("/offers", response_model=List[OfferRead])
async def list_offers(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """List offers received by the current artisan."""
    if current_user.role.name != "artisan" and current_user.role.name != "admin":
        offers = db.query(Offer).join(Artwork).filter(Artwork.artisan_id == current_user.id).all()
    else:
        offers = db.query(Offer).all()
    return [_enrich_offer_read(db, o) for o in offers]


@router.post("/offers/{artwork_id}", response_model=OfferRead)
async def create_offer(
    artwork_id: str,
    offer_data: OfferCreate,
    current_user: User = Depends(get_buyer),
    db: Session = Depends(get_db)
):
    """Create an offer for an artwork (buyer only)."""
    artwork = _get_artwork_by_id_or_404(db, artwork_id)
    existing = db.query(Offer).filter(
        Offer.artwork_id == artwork.id,
        Offer.buyer_id == current_user.id,
        Offer.status == "pending"
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You already have a pending offer")

    offer = Offer(
        artwork_id=artwork.id,
        buyer_id=current_user.id,
        amount=offer_data.amount,
        currency=offer_data.currency,
        message=offer_data.message,
        expires_at=offer_data.expires_at,
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return _enrich_offer_read(db, offer)


@router.post("/offers/{offer_id}/accept", response_model=OfferRead)
async def accept_offer(offer_id: str, current_user: User = Depends(get_artisan), db: Session = Depends(get_db)):
    """Accept an offer (artisan only)."""
    offer = db.get(Offer, offer_id)
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")
    if offer.artwork.artisan_id != current_user.id and current_user.role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    offer.status = "accepted"
    offer.responded_at = __import__("datetime").datetime.utcnow()
    db.commit()
    db.refresh(offer)
    return _enrich_offer_read(db, offer)


@router.post("/offers/{offer_id}/reject", response_model=OfferRead)
async def reject_offer(offer_id: str, current_user: User = Depends(get_artisan), db: Session = Depends(get_db)):
    """Reject an offer (artisan only)."""
    offer = db.get(Offer, offer_id)
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")
    if offer.artwork.artisan_id != current_user.id and current_user.role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    offer.status = "rejected"
    offer.responded_at = __import__("datetime").datetime.utcnow()
    db.commit()
    db.refresh(offer)
    return _enrich_offer_read(db, offer)


@router.post("/wishlist/{artwork_id}", response_model=WishlistRead, status_code=status.HTTP_201_CREATED)
async def add_to_wishlist(artwork_id: str, current_user: User = Depends(get_buyer), db: Session = Depends(get_db)):
    """Add artwork to wishlist (buyer only)."""
    artwork = _get_artwork_by_id_or_404(db, artwork_id)
    existing = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.artwork_id == artwork.id
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already in wishlist")

    wishlist_item = Wishlist(user_id=current_user.id, artwork_id=artwork.id)
    db.add(wishlist_item)
    db.commit()
    db.refresh(wishlist_item)
    return WishlistRead.model_validate(wishlist_item)


@router.delete("/wishlist/{artwork_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_wishlist(artwork_id: str, current_user: User = Depends(get_buyer), db: Session = Depends(get_db)):
    """Remove artwork from wishlist."""
    artwork = _get_artwork_by_id_or_404(db, artwork_id)
    item = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.artwork_id == artwork.id
    ).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not in wishlist")
    db.delete(item)
    db.commit()
    return None


@router.get("/wishlist", response_model=List[WishlistRead])
async def list_wishlist(current_user: User = Depends(get_buyer), db: Session = Depends(get_db)):
    """List user's wishlist."""
    items = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).all()
    return [WishlistRead.model_validate(item) for item in items]


def _get_artwork_by_id_or_404(db: Session, artwork_id: str) -> Artwork:
    artwork = db.query(Artwork).filter(Artwork.artwork_id == artwork_id).first()
    if not artwork:
        artwork = db.get(Artwork, artwork_id)
    if not artwork:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artwork not found")
    return artwork


def _enrich_order_read(db: Session, order: Order) -> OrderRead:
    items = []
    for oi in order.order_items:
        artwork = db.get(Artwork, oi.artwork_id)
        img_url = None
        if artwork and artwork.images:
            img = next((i for i in artwork.images if i.is_primary), artwork.images[0])
            img_url = img.url
        items.append(OrderItemRead(
            id=str(oi.id),
            order_id=order.id,
            artwork_id=str(oi.artwork_id) if oi.artwork_id else "",
            price=oi.price,
            quantity=oi.quantity,
            platform_fee_amount=oi.platform_fee_amount,
            artisan_payout_amount=oi.artisan_payout_amount,
            status=oi.status,
            created_at=oi.created_at,
            artwork_title=artwork.title if artwork else None,
            artwork_image_url=img_url,
            artisan_name=artwork.artisan.display_name if artwork and artwork.artisan else None,
        ))

    payments = [PaymentRead.model_validate(p) for p in order.payments]
    pf_records = [PlatformFeeRead.model_validate(pf) for pf in order.platform_fees]
    payout_records = [ArtisanPayoutRead.model_validate(pa) for pa in order.artisan_payouts]

    return OrderRead.model_validate(order, update={"items": items, "payments": payments, "platform_fee_records": pf_records, "artisan_payout_records": payout_records})


def _enrich_offer_read(db: Session, offer: Offer) -> OfferRead:
    artwork = db.get(Artwork, offer.artwork_id)
    buyer = db.get(User, offer.buyer_id)
    return OfferRead.model_validate(offer, update={
        "buyer_name": buyer.display_name or buyer.full_name if buyer else None,
        "artwork_title": artwork.title if artwork else None,
        "artwork_image_url": artwork.images[0].url if artwork and artwork.images else None,
        "price": artwork.price if artwork else None,
    })
