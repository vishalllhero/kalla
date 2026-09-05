"""
KALAA Seed Data Script
Creates realistic demo data for all roles, artworks, certificates, orders, etc.
"""
import sys
import os
import random
from uuid import uuid4
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.core.config import settings
from app.core.security import hash_password
from app.models import *
from app.utils import generate_qr_data, calculate_platform_fee
from app.services.blockchain import get_blockchain_service as _get_bc_service
from app.services.ai import AIServiceFactory

CRAFTS = [
    "Blue Pottery", "Madhubani Painting", "Pattachitra", "Warli Art",
    "Phulkari", "Banarasi Weaving", "Dhokra", "Wood Carving",
    "Terracotta", "Handloom Textiles", "Brass Casting", "Stone Carving",
    "Paper Mache", "Block Printing", "Tie and Dye", "Zari Work",
    "Kalamkari", "Gond Painting", "Mithila Painting", "Kantha Embroidery",
]

MATERIALS = ["Ceramic", "Terracotta", "Cotton", "Silk", "Wood", "Brass", "Stone", "Clay", "Metal", "Bamboo", "Jute", "Cane"]

REGIONS = [
    "Jaipur, Rajasthan", "Varanasi, Uttar Pradesh", "Patna, Bihar",
    "Mumbai, Maharashtra", "Kolkata, West Bengal", "Chennai, Tamil Nadu",
    "Hyderabad, Telangana", "Bengaluru, Karnataka", "Pune, Maharashtra",
    "Ahmedabad, Gujarat", "Lucknow, Uttar Pradesh", "Chandigarh, Chandigarh",
    "Jodhpur, Rajasthan", "Amritsar, Punjab", "Bhubaneswar, Odisha",
]

ARTISAN_NAMES = [
    ("Ramesh Kumar", "Jaipur, Rajasthan", "Blue Pottery", "Ceramic", "https://placehold.co/400x400/f5e6da/8b4513?text=Ramesh"),
    ("Priya Sharma", "Varanasi, Uttar Pradesh", "Madhubani Painting", "Paper", "https://placehold.co/400x400/f5e6da/8b4513?text=Priya"),
    ("Anil Verma", "Patna, Bihar", "Warli Art", "Natural Pigments", "https://placehold.co/400x400/f5e6da/8b4513?text=Anil"),
    ("Meera Devi", "Kolkata, West Bengal", "Pattachitra", "Cloth", "https://placehold.co/400x400/f5e6da/8b4513?text=Meera"),
    ("Sunita Kumari", "Lucknow, Uttar Pradesh", "Chikankari", "Cotton", "https://placehold.co/400x400/f5e6da/8b4513?text=Sunita"),
    ("Rajesh Thakur", "Bhopal, Madhya Pradesh", "Terracotta", "Clay", "https://placehold.co/400x400/f5e6da/8b4513?text=Rajesh"),
    ("Kavita Patel", "Ahmedabad, Gujarat", "Block Printing", "Cotton", "https://placehold.co/400x400/f5e6da/8b4513?text=Kavita"),
    ("Mohan Lal", "Chennai, Tamil Nadu", "Stone Carving", "Stone", "https://placehold.co/400x400/f5e6da/8b4513?text=Mohan"),
    ("Lakshmi Narayan", "Hyderabad, Telangana", "Bidriware", "Metal", "https://placehold.co/400x400/f5e6da/8b4513?text=Lakshmi"),
    ("Gita Prasad", "Bengaluru, Karnataka", "Wood Carving", "Wood", "https://placehold.co/400x400/f5e6da/8b4513?text=Gita"),
]

ARTWORK_TITLES = [
    "Royal Blue Pottery Vase", "Peacock Madhubani Painting", "Warli Tribal Dance",
    "Sacred Pattachitra Scroll", "Phulkari Dupatta", "Banarasi Silk Saree",
    "Dhokra Metal Necklace", "Hand-Carved Wooden Bowl", "Terracotta Planters",
    "Handloom Cotton Quilt", "Brass Diya Lamp", "Stone Shiva Statue",
    "Paper Mache Decorative Box", "Block Printed Curtains", "Tie Dye Scarf",
    "Zari Embroidered Shawl", "Kalamkari Wall Hanging", "Gond Forest Painting",
    "Mithila Wedding Scene", "Kantha Stitched Quilt", "Blue Pottery Serving Tray",
    "Madhubani Peacock", "Warli House Scene", "Pattachitra Elephant",
    "Phulkari Pillow Covers", "Banarasi Brocade Stole", "Dhokra Horse",
    "Wooden Elephant", "Terracotta Water Pot", "Handloom Table Runner",
    "Brass Door Knocker", "Stone Lotus Sculpture", "Paper Mache Mask",
    "Block Printed Bed Sheet", "Tie Dye Tablecloth", "Zari Work Wall Art",
    "Kalamkari Pillow", "Gond Tree of Life", "Mithila Fish", "Kantha Cushion",
]

BUYER_NAMES = [
    ("Priya Desai", "Mumbai, Maharashtra"),
    ("Rahul Mehta", "Delhi"),
    ("Ananya Reddy", "Hyderabad, Telangana"),
    ("Vikram Malhotra", "Chandigarh, Chandigarh"),
    ("Sneha Iyer", "Pune, Maharashtra"),
    ("Arjun Khanna", "Kolkata, West Bengal"),
    ("Deepika Nair", "Chennai, Tamil Nadu"),
    ("Rohan Gupta", "Lucknow, Uttar Pradesh"),
    ("Neha Joshi", "Jaipur, Rajasthan"),
    ("Karan Verma", "Ahmedabad, Gujarat"),
]


def seed():
    db = SessionLocal()

    try:
        # Clear existing data
        for table in [Report, Notification, OwnershipTransfer, ProvenanceEvent, BlockchainRecord,
                       Certificate, Offer, Wishlist, OrderItem, Order, PlatformFee, ArtisanPayout,
                       Payment, AIImageJob, AIPricePrediction, AICatalog, AIRecommendation, B2BMatch,
                       B2BRequest, ArtisanPayout, OrderItem]:
            pass

        # Drop and recreate all tables
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        print("Database tables created.")

        # 1. Create Roles
        roles_data = [
            ("admin", "Administrator", "Full access to the platform", "manage_users,verify_artisans,verify_artworks,manage_categories,monitor_transactions,manage_reports"),
            ("artisan", "Artisan", "Can create and sell artworks", "create_artwork,upload_image,use_ai,browse_marketplace,receive_orders,manage_inventory"),
            ("buyer", "Buyer", "Can browse and purchase artworks", "browse_artworks,search,create_orders,make_offers,wishlist,purchase"),
        ]
        roles = {}
        for name, display, desc, perms in roles_data:
            role = Role(name=name, display_name=display, description=desc, permissions=perms)
            db.add(role)
        db.commit()

        roles = {r.name: r for r in db.query(Role).all()}
        print(f"Created {len(roles)} roles: {list(roles.keys())}")

        # 2. Create Admin User
        admin = User(
            email=settings.ADMIN_EMAIL,
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            role_id=roles["admin"].id,
            display_name="Admin User",
            full_name="Admin User",
            is_active=True,
            is_verified=True,
            preferred_language="en",
            country_code="IN",
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        admin_profile = AdminProfile(user_id=admin.id, admin_level="super")
        db.add(admin_profile)
        db.commit()

        print(f"Created admin user: {admin.email}")

        # 3. Create Artisan Users
        artisans = []
        for i, (name, region, craft, material, avatar_url) in enumerate(ARTISAN_NAMES):
            email = f"artisan{i+1}@kalaamarket.com"
            region_city = region.split(",")[0]
            region_state = region.split(",")[1].strip() if "," in region else "India"

            user = User(
                email=email,
                password_hash=hash_password(f"Artisan@123"),
                role_id=roles["artisan"].id,
                display_name=name,
                full_name=name,
                avatar_url=avatar_url,
                is_active=True,
                is_verified=True,
                preferred_language="hi" if i % 3 == 0 else "en",
                country_code="IN",
            )
            db.add(user)
            db.flush()

            artisan_id = f"KLA-ART-{2026}-{i+1:04d}"
            profile = ArtisanProfile(
                user_id=user.id,
                artisan_id=artisan_id,
                artisan_name=name,
                bio=f"Experienced {craft} artisan from {region}. Creating authentic handmade crafts using traditional techniques.",
                craft_experience_years=random.randint(5, 25),
                workshop_location=region,
                region=region_city,
                state=region_state,
                is_verified=i < 8,
                verification_status="approved" if i < 8 else "pending",
                badge_level="gold" if i < 3 else ("silver" if i < 6 else "bronze"),
                total_listings=0,
                avg_rating=f"{random.uniform(4.2, 4.9):.1f}",
                id_proof_type="Aadhaar",
                id_proof_url=f"https://placehold.co/100x100/ddd/999?text=ID+{i+1}",
                is_approved_to_sell=i < 8,
                instagram_handle=f"@{name.lower().replace(' ', '')}_crafts",
            )
            db.add(profile)
            db.commit()
            db.refresh(user)
            db.refresh(profile)
            artisans.append((user, profile))
            print(f"Created artisan: {name} ({artisan_id}) - {craft}")

        # 4. Create Buyer Users
        buyers = []
        for i, (name, location) in enumerate(BUYER_NAMES):
            email = f"buyer{i+1}@kalaamarket.com"
            user = User(
                email=email,
                password_hash=hash_password(f"Buyer@123"),
                role_id=roles["buyer"].id,
                display_name=name,
                full_name=name,
                is_active=True,
                is_verified=True,
                preferred_language="en",
                country_code="IN",
            )
            db.add(user)
            db.flush()
            profile = BuyerProfile(
                user_id=user.id,
                full_name=name,
                phone=f"+91-9{random.randint(10000000, 99999999)}",
                address_line1=f"{random.randint(1, 100)} Main Street",
                city=location.split(",")[0],
                state=location.split(",")[1].strip() if "," in location else location,
                pincode=f"{random.randint(100000, 999999)}",
                country="India",
                is_business=random.choice([True, False, False]),
            )
            db.add(profile)
            db.commit()
            db.refresh(user)
            db.refresh(profile)
            buyers.append((user, profile))
            print(f"Created buyer: {name} ({email})")

        # 5. Create Categories
        categories_data = [
            ("Pottery & Ceramics", "pottery", "Handmade pottery, ceramics, terracotta", "🫖", 1),
            ("Paintings", "paintings", "Traditional and contemporary paintings", "🎨", 2),
            ("Textiles & Apparel", "textiles", "Handloom, embroidery, and textile crafts", "🧵", 3),
            ("Jewelry", "jewelry", "Handmade jewelry and ornaments", "💎", 4),
            ("Wood Crafts", "wood", "Carved and crafted wooden items", "🪵", 5),
            ("Metal Crafts", "metal", "Brass, copper, and metal artisan work", "🔩", 6),
            ("Stone Crafts", "stone", "Sculptures and carved stone items", "🪨", 7),
            ("Paper Mache", "paper-mache", "Decorative paper mache items", "📜", 8),
            ("Bamboo Crafts", "bamboo", "Bamboo and cane crafts", "🎋", 9),
            ("Home Decor", "home-decor", "Decorative items for the home", "🏠", 10),
        ]
        categories = {}
        for name, slug, desc, icon, order in categories_data:
            cat = Category(name=name, slug=slug, description=desc, icon=icon, display_order=order)
            db.add(cat)
        db.commit()
        for cat in db.query(Category).all():
            categories[cat.slug] = cat
        print(f"Created {len(categories)} categories")

        # 6. Create Artworks
        artworks = []
        for i in range(25):
            artisan = random.choice(artisans)[0]
            artisan_profile = artisan.artisan_profile
            craft = random.choice(CRAFTS)
            material = random.choice(MATERIALS)
            region = random.choice(REGIONS)
            title = f"{ARTWORK_TITLES[i % len(ARTWORK_TITLES)]} - {region.split(',')[0]}" if i < len(ARTWORK_TITLES) else f"Artisan Craft {i+1}"
            if i >= len(ARTWORK_TITLES):
                title = f"{craft} {material} Piece from {region.split(',')[0]}"

            price = random.randint(800, 15000)
            status = random.choices(["verified", "listed", "listed", "listed"], weights=[0.3, 0.2, 0.35, 0.15])[0]
            is_verified = status in ("verified", "listed")
            is_listed = status == "listed"

            artwork = Artwork(
                artwork_id=f"KLA-ART-2026-{i+1:06d}",
                title=title,
                description=f"This authentic handmade {craft} artwork is crafted from {material} by skilled artisans in {region}. Each piece is unique and tells a story of traditional craftsmanship.",
                artisan_id=artisan.id,
                category_id=random.choice(list(categories.values())).id,
                craft=craft,
                material=material,
                region=region.split(",")[0],
                state=region.split(",")[1].strip() if "," in region else "India",
                creation_year=2025,
                dimensions=f"{random.randint(6, 24)} x {random.randint(6, 24)} inches",
                weight_kg=f"{random.randint(1, 5)} kg",
                production_time_days=random.randint(3, 21),
                is_handmade=True,
                care_instructions="Handle with care. Clean gently with a soft, dry cloth. Keep away from direct sunlight and moisture.",
                tags=f"{craft},{material},{region.split(',')[0]},handmade,artisan,traditional",
                seo_keywords=f"{craft.lower()},{material.lower()},{region.lower()},handicraft,india",
                price=price,
                currency="INR",
                is_negotiable=True,
                status=status,
                is_verified=is_verified,
                is_listed=is_listed,
                view_count=random.randint(10, 500),
                favorite_count=random.randint(1, 50),
                blockchain_status="registered" if is_verified else "not_registered",
                blockchain_network="KALAA Testnet (Mock)" if is_verified else "testnet",
                ai_catalog_generated=random.choice([True, False]),
                ai_price_suggested=random.choice([True, False]),
                image_enhanced=random.choice([True, False]),
                verified_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)) if is_verified else None,
                listed_at=datetime.utcnow() - timedelta(days=random.randint(1, 20)) if is_listed else None,
            )
            db.add(artwork)
            db.flush()

            artisan_profile.total_sales = random.randint(0, 50)
            artisan_profile.total_listings += 1

            primary_url = f"https://placehold.co/600x600/ddd/999?text={craft.replace(' ', '+')}+{i+1}"
            thumb_url = f"https://placehold.co/100x100/ddd/999?text={craft.replace(' ', '+')}+{i+1}"

            image = ArtworkImage(
                artwork_id=artwork.id,
                url=primary_url,
                thumbnail_url=thumb_url,
                alt_text=f"{artwork.title} - primary image",
                is_primary=True,
                width=600,
                height=600,
                file_size_bytes=random.randint(50000, 200000),
            )
            db.add(image)

            for j in range(random.randint(0, 3)):
                img = ArtworkImage(
                    artwork_id=artwork.id,
                    url=f"https://placehold.co/600x600/ddd/999?text={craft.replace(' ', '+')}-{j+2}",
                    thumbnail_url=f"https://placehold.co/100x100/ddd/999?text={craft.replace(' ', '+')}-{j+2}",
                    alt_text=f"{artwork.title} - image {j+2}",
                    is_primary=False,
                    sort_order=j+1,
                    width=600,
                    height=600,
                )
                db.add(img)

            attrs = [
                ("Craft", craft),
                ("Material", material),
                ("Region", region.split(",")[0]),
                ("State", region.split(",")[1].strip() if "," in region else "India"),
                ("Creation Year", str(2025)),
                ("Made By", "Hand"),
            ]
            for attr_name, attr_val in attrs:
                db.add(ArtworkAttribute(artwork_id=artwork.id, attribute_name=attr_name, attribute_value=attr_val))

            artworks.append(artwork)
            db.commit()

        print(f"Created {len(artworks)} artworks")

        # 7. Create Certificates and Blockchain Records for verified artworks
        blockchain = _get_bc_service()
        from app.services.storage.local import LocalStorageService
        storage = LocalStorageService()

        certified_count = 0
        for artwork in artworks:
            if artwork.is_verified and artwork.status in ("verified", "listed"):
                cert_id = f"KLA-CERT-{certified_count + 1:06d}"
                while db.query(Certificate).filter(Certificate.certificate_id == cert_id).first():
                    certified_count += 1
                    cert_id = f"KLA-CERT-{certified_count + 1:06d}"

                metadata = {
                    "artwork_id": artwork.artwork_id,
                    "certificate_id": cert_id,
                    "title": artwork.title,
                    "description": artwork.description,
                    "artisan": artwork.artisan.display_name,
                    "craft": artwork.craft,
                    "material": artwork.material,
                    "region": artwork.region,
                    "creation_year": artwork.creation_year,
                    "price": artwork.price,
                    "image_url": artwork.images[0].url if artwork.images else None,
                    "registration_date": datetime.utcnow().isoformat(),
                }

                import asyncio
                blockchain_result = asyncio.run(blockchain.register_artwork(
                    artwork_id=artwork.artwork_id,
                    certificate_id=cert_id,
                    metadata_hash=storage.get_metadata_hash(metadata),
                    owner_address=f"0x{artwork.artisan_id.replace('-', '')[:40]}" + "0" * max(0, 42 - 42 + 40 - len(artwork.artisan_id.replace('-', ''))),
                    metadata_uri=f"ipfs://{storage.get_ipfs_cid(metadata)}",
                ))

                qr_data = generate_qr_data(artwork.artwork_id)

                certificate = Certificate(
                    certificate_id=cert_id,
                    artwork_id=artwork.id,
                    artisan_id=artwork.artisan_id,
                    certificate_hash=storage.get_metadata_hash(metadata),
                    metadata_hash=storage.get_metadata_hash(metadata),
                    ipfs_cid=storage.get_ipfs_cid(metadata),
                    storage_provider="local",
                    blockchain_network="KALAA Testnet (Mock)",
                    blockchain_tx_hash=blockchain_result["transaction_hash"],
                    qr_code_url=qr_data,
                    qr_code_data=qr_data,
                    metadata_url=f"ipfs://{storage.get_ipfs_cid(metadata)}",
                    issue_date=datetime.utcnow(),
                    status="active",
                )
                db.add(certificate)

                artwork.certificate_id = cert_id
                artwork.blockchain_txn_hash = blockchain_result["transaction_hash"]
                db.commit()

                blockchain_record = BlockchainRecord(
                    artwork_id=artwork.id,
                    certificate_id=certificate.id,
                    transaction_hash=blockchain_result["transaction_hash"],
                    block_number=blockchain_result.get("block_number"),
                    gas_used=blockchain_result.get("gas_used"),
                    network="KALAA Testnet (Mock)",
                    contract_address=blockchain_result.get("contract_address", ""),
                    function_name="registerArtwork",
                    event_type="ArtworkRegistered",
                    status="success",
                    timestamp_on_chain=datetime.utcnow(),
                    tx_data=blockchain_result,
                )
                db.add(blockchain_record)

                provenance_events = [
                    ProvenanceEvent(
                        artwork_id=artwork.id,
                        event_type="CREATED",
                        description=f"Artwork created by {artwork.artisan.display_name}",
                        actor_id=artwork.artisan_id,
                        actor_type="artisan",
                        is_on_chain=False,
                        sequence_order=0,
                    ),
                    ProvenanceEvent(
                        artwork_id=artwork.id,
                        event_type="REGISTERED",
                        description=f"Artwork registered on blockchain",
                        actor_id=artwork.artisan_id,
                        actor_type="artisan",
                        blockchain_tx_hash=blockchain_result["transaction_hash"],
                        is_on_chain=True,
                        sequence_order=1,
                    ),
                    ProvenanceEvent(
                        artwork_id=artwork.id,
                        event_type="CERTIFIED",
                        description=f"Digital certificate issued ({cert_id})",
                        actor_id=artwork.artisan_id,
                        actor_type="artisan",
                        blockchain_tx_hash=blockchain_result["transaction_hash"],
                        is_on_chain=True,
                        sequence_order=2,
                    ),
                    ProvenanceEvent(
                        artwork_id=artwork.id,
                        event_type="LISTED",
                        description="Artwork listed on KALAA marketplace",
                        actor_id=artwork.artisan_id,
                        actor_type="artisan",
                        is_on_chain=True,
                        sequence_order=3,
                    ),
                ]
                db.add_all(provenance_events)

                if artwork.status == "listed":
                    provenance_events.append(ProvenanceEvent(
                        artwork_id=artwork.id,
                        event_type="LISTED",
                        description="Artwork listed on KALAA marketplace",
                        actor_id=artwork.artisan_id,
                        actor_type="artisan",
                        is_on_chain=True,
                        sequence_order=4,
                    ))

                certified_count += 1

        print(f"Created {certified_count} certificates and blockchain records")

        # 8. Create Orders (some artworks sold)
        sold_artworks = [a for a in artworks if a.is_verified and a.status == "listed"]
        selected_for_sale = random.sample(sold_artworks, min(8, len(sold_artworks)))

        order_count = 0
        for artwork in selected_for_sale:
            buyer = random.choice(buyers)[0]
            order_number = f"KLA-ORD-2026-{order_count + 1:06d}"

            fee_info = calculate_platform_fee(artwork.price, settings.PLATFORM_FEE_PERCENT)

            order = Order(
                order_number=order_number,
                buyer_id=buyer.id,
                artisan_id=artwork.artisan_id,
                status="completed",
                total_amount=artwork.price,
                currency="INR",
                platform_fee=fee_info["platform_fee"],
                artisan_payout=fee_info["artisan_payout"],
                payment_status="paid",
                shipping_status="delivered",
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 15)),
                completed_at=datetime.utcnow() - timedelta(days=random.randint(1, 10)),
            )
            db.add(order)
            db.flush()

            order_item = OrderItem(
                order_id=order.id,
                artwork_id=artwork.id,
                price=artwork.price,
                quantity=1,
                platform_fee_amount=fee_info["platform_fee"],
                artisan_payout_amount=fee_info["artisan_payout"],
                status="delivered",
                created_at=order.created_at,
            )
            db.add(order_item)

            payment = Payment(
                order_id=order.id,
                transaction_id=f"txn_{uuid4().hex[:16]}",
                amount=artwork.price,
                currency="INR",
                payment_method="mock",
                payment_status="completed",
                gateway_response={"authorization_code": "".join(random.choices("0123456789", k=6))},
                created_at=order.created_at,
                completed_at=order.completed_at,
            )
            db.add(payment)

            pf = PlatformFee(
                order_id=order.id,
                amount=fee_info["platform_fee"],
                currency="INR",
                percentage=settings.PLATFORM_FEE_PERCENT,
                fee_type="primary_sale",
                description=f"KALAA {settings.PLATFORM_FEE_PERCENT}% platform fee",
                transaction_date=order.created_at,
            )
            db.add(pf)

            payout = ArtisanPayout(
                order_id=order.id,
                artisan_id=artwork.artisan_id,
                amount=fee_info["artisan_payout"],
                currency="INR",
                order_total=artwork.price,
                platform_fee=fee_info["platform_fee"],
                net_payout=fee_info["artisan_payout"],
                payment_status="completed",
                transaction_id=payment.transaction_id,
                processed_at=order.completed_at,
            )
            db.add(payout)

            artwork.status = "sold"
            artwork.current_owner_id = buyer.id
            artwork.sold_at = order.completed_at
            artwork.is_listed = False

            owner_addr = f"0x{buyer.id.replace('-', '')[:40]}" + "0" * max(0, 42 - 42 + 46)
            prev_owner_addr = f"0x{artwork.artisan_id.replace('-', '')[:40]}" + "0" * max(0, 42 - 42 + 46)

            from app.services.blockchain import get_blockchain_service as _get_bc
            blockchain_transfer = _get_bc()

            try:
                import asyncio
                tx_result = asyncio.run(blockchain_transfer.transfer_artwork(
                    artwork_id=artwork.artwork_id,
                    from_address=prev_owner_addr,
                    to_address=owner_addr,
                    order_id=str(order.id),
                ))

                provenance_events = [
                    ProvenanceEvent(
                        artwork_id=artwork.id,
                        event_type="SOLD",
                        description=f"Sold to {buyer.full_name or buyer.display_name}",
                        actor_id=buyer.id,
                        actor_type="buyer",
                        blockchain_tx_hash=tx_result.get("transaction_hash"),
                        is_on_chain=True,
                        sequence_order=4,
                    ),
                    ProvenanceEvent(
                        artwork_id=artwork.id,
                        event_type="OWNERSHIP_TRANSFERRED",
                        description=f"Ownership transferred to {buyer.full_name or buyer.display_name}",
                        actor_id=buyer.id,
                        actor_type="buyer",
                        blockchain_tx_hash=tx_result.get("transaction_hash"),
                        is_on_chain=True,
                        sequence_order=5,
                    ),
                ]
                db.add_all(provenance_events)

                cert = db.query(Certificate).filter(Certificate.artwork_id == artwork.id).first()
                if cert:
                    cert.status = "transferred"
                    cert.blockchain_tx_hash = tx_result.get("transaction_hash")
            except Exception as e:
                print(f"  Blockchain transfer for {artwork.artwork_id}: {e}")

            order_count += 1
            db.commit()

        print(f"Created {order_count} orders with ownership transfers")

        # 9. Create B2B Requests
        b2b_crafts = random.sample(CRAFTS, 5)
        for i, craft in enumerate(b2b_crafts):
            buyer = random.choice(buyers)[0]
            req = B2BRequest(
                buyer_id=buyer.id,
                title=f"Bulk Order: {craft} Collection",
                description=f"Seeking high-quality {craft} artisans for bulk order. Need {random.randint(50, 500)} pieces for retail distribution.",
                category_id=random.choice(list(categories.values())).id,
                craft=craft,
                material=random.choice(MATERIALS),
                region=random.choice(REGIONS),
                quantity_required=random.randint(50, 500),
                budget_min=random.randint(500, 2000),
                budget_max=random.randint(2000, 8000),
                deadline=datetime.utcnow() + timedelta(days=random.randint(15, 30)),
                priority=random.choice(["low", "medium", "high"]),
                status="open",
            )
            db.add(req)
        db.commit()

        b2b_count = db.query(B2BRequest).count()
        print(f"Created {b2b_count} B2B requests")

        # 10. Create B2B Matches
        from app.services.ai import AIServiceFactory
        for req in db.query(B2BRequest).all():
            match_params = {
                "craft": req.craft,
                "category_id": req.category_id,
                "material": req.material,
                "region": req.region,
                "budget_min": req.budget_min,
                "budget_max": req.budget_max,
                "quantity": req.quantity_required,
            }
            matches = asyncio.run(AIServiceFactory.get_recommendation_service().get_b2b_matches(match_params, limit=3))
            for match_data in matches:
                artisan = db.get(User, match_data["artisan_id"])
                if not artisan:
                    artisan = random.choice(artisans)[0]
                    match_data["artisan_id"] = str(artisan.id)

                match = B2BMatch(
                    b2b_request_id=req.id,
                    artisan_id=artisan.id,
                    match_score=match_data["match_score"],
                    match_factors=match_data.get("match_factors", {}),
                )
                db.add(match)
        db.commit()

        match_count = db.query(B2BMatch).count()
        print(f"Created {match_count} B2B matches")

        # 11. Create Wishlist items
        for buyer in buyers:
            user = buyer[0]
            wishlist_artworks = random.sample(
                [a for a in artworks if a.is_listed and a.status == "listed"],
                min(random.randint(2, 5), len([a for a in artworks if a.is_listed]))
            ) if any(a.is_listed for a in artworks) else []
            for aw in wishlist_artworks:
                existing = db.query(Wishlist).filter(Wishlist.user_id == user.id, Wishlist.artwork_id == aw.id).first()
                if not existing:
                    db.add(Wishlist(user_id=user.id, artwork_id=aw.id))
        db.commit()

        wishlist_count = db.query(Wishlist).count()
        print(f"Created {wishlist_count} wishlist items")

        # 12. Create some Offers
        for i in range(5):
            buyer = random.choice(buyers)[0]
            listed_artwork = random.choice([a for a in artworks if a.is_listed and a.status == "listed"])
            offer = Offer(
                artwork_id=listed_artwork.id,
                buyer_id=buyer.id,
                amount=int(listed_artwork.price * random.uniform(0.6, 0.9)),
                currency="INR",
                message="Looking forward to your response!",
                status="pending",
                expires_at=datetime.utcnow() + timedelta(days=3),
            )
            db.add(offer)
        db.commit()
        offer_count = db.query(Offer).count()
        print(f"Created {offer_count} offers")

        # 13. Create Notifications
        for i, (user, _) in enumerate(artisans[:5]):
            notification = Notification(
                recipient_id=user.id,
                title="New Order Received",
                message=f"You received a new order. Order #KLA-ORD-2026-{i+1:06d}",
                notification_type="order_placed",
                related_type="order",
                is_read=False,
            )
            db.add(notification)

        for i, (user, _) in enumerate(buyers[:3]):
            notification = Notification(
                recipient_id=user.id,
                title="Artwork Verified",
                message=f"Your favorite artwork has been verified on blockchain.",
                notification_type="artwork_verified",
                is_system=True,
                is_read=False,
            )
            db.add(notification)
        db.commit()

        notification_count = db.query(Notification).count()
        print(f"Created {notification_count} notifications")

        # 14. Create Reports
        for i in range(3):
            reporter = random.choice(buyers)[0]
            subject = random.choice(artworks)
            report = Report(
                reporter_id=reporter.id,
                report_type="inappropriate_content",
                subject_type="artwork",
                subject_id=subject.id,
                title=f"Report: {subject.title[:50]}",
                description="This artwork appears to be mass-produced.",
                status="pending",
            )
            db.add(report)
        db.commit()
        print("Created 3 reports")

        # 15. Create AI-generated catalogs and price predictions for demo
        for artwork in artworks[:5]:
            catalog = AICatalog(
                artwork_id=artwork.id,
                input_text=f"This is a {artwork.craft} piece made from {artwork.material} in {artwork.region}.",
                input_language="en",
                generated_title=artwork.title,
                generated_description=artwork.description,
                generated_craft=artwork.craft,
                generated_material=artwork.material,
                generated_region=artwork.region,
                generated_tags=artwork.tags,
                generated_seo_keywords=artwork.seo_keywords,
                generated_care_instructions=artwork.care_instructions,
                generated_dimensions=artwork.dimensions,
                generated_production_time=artwork.production_time_days,
                confidence_score=0.92,
                provider="mock",
                is_applied=True,
                applied_at=datetime.utcnow(),
            )
            db.add(catalog)

            prediction = AIPricePrediction(
                artwork_id=artwork.id,
                inputs={"material_cost": 500, "labour_cost": 800, "production_time_days": artwork.production_time_days, "craft_type": artwork.craft},
                suggested_price=artwork.price,
                min_price=int(artwork.price * 0.88),
                max_price=int(artwork.price * 1.12),
                premium_price=int(artwork.price * 1.3),
                confidence_score=0.88,
                factors={"craft_premium": 1.3, "market_multiplier": 2.0},
                provider="mock",
            )
            db.add(prediction)
        db.commit()
        print("Created AI catalogs and price predictions")

        print("\n=== Seed complete! ===")
        print(f"Roles: 3")
        print(f"Users: {db.query(User).count()} (1 admin, {len(artisans)} artisans, {len(buyers)} buyers)")
        print(f"Artworks: {len(artworks)}")
        print(f"Categories: {len(categories)}")
        print(f"Orders: {db.query(Order).count()}")
        print(f"Certificates: {db.query(Certificate).count()}")
        print(f"B2B Requests: {db.query(B2BRequest).count()}")

        print("\nDemo Credentials:")
        print(f"  Admin: {settings.ADMIN_EMAIL} / {settings.ADMIN_PASSWORD}")
        print(f"  Artisan: artisan1@kalaamarket.com / Artisan@123")
        print(f"  Buyer: buyer1@kalaamarket.com / Buyer@123")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
