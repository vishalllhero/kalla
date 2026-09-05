import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from .base import UUIDType, Base


class Artwork(Base):
    __tablename__ = "artworks"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    artwork_id = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    artisan_id = Column(UUIDType, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    craft = Column(String(100), nullable=True)
    material = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    creation_year = Column(Integer, nullable=True)
    dimensions = Column(String(200), nullable=True)
    weight_kg = Column(String(50), nullable=True)
    production_time_days = Column(Integer, default=0, nullable=False)
    is_handmade = Column(Boolean, default=True, nullable=False)
    care_instructions = Column(Text, nullable=True)
    tags = Column(String(1000), nullable=True, default="")
    seo_keywords = Column(String(1000), nullable=True, default="")
    price = Column(Integer, nullable=True)
    currency = Column(String(10), default="INR", nullable=False)
    is_negotiable = Column(Boolean, default=True, nullable=False)
    status = Column(String(30), default="draft", nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_listed = Column(Boolean, default=False, nullable=False)
    view_count = Column(Integer, default=0, nullable=False)
    favorite_count = Column(Integer, default=0, nullable=False)
    certificate_id = Column(String(50), unique=True, nullable=True)
    blockchain_status = Column(String(30), default="not_registered", nullable=False)
    blockchain_txn_hash = Column(String(100), nullable=True)
    blockchain_network = Column(String(50), default="testnet", nullable=True)
    current_owner_id = Column(UUIDType, ForeignKey("users.id"), nullable=True)
    ai_catalog_generated = Column(Boolean, default=False, nullable=False)
    ai_price_suggested = Column(Boolean, default=False, nullable=False)
    image_enhanced = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)
    listed_at = Column(DateTime, nullable=True)
    sold_at = Column(DateTime, nullable=True)

    artisan = relationship("User", foreign_keys=[artisan_id])
    category = relationship("Category", back_populates="artworks")
    images = relationship("ArtworkImage", back_populates="artwork", cascade="all, delete-orphan")
    attributes = relationship("ArtworkAttribute", back_populates="artwork", cascade="all, delete-orphan")
    certificate = relationship("Certificate", uselist=False, back_populates="artwork", cascade="all, delete-orphan")
    blockchain_records = relationship("BlockchainRecord", back_populates="artwork", cascade="all, delete-orphan")
    provenance_events = relationship("ProvenanceEvent", back_populates="artwork", cascade="all, delete-orphan")
    ownership_transfers = relationship("OwnershipTransfer", back_populates="artwork", cascade="all, delete-orphan")
    offers = relationship("Offer", back_populates="artwork", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="artwork", cascade="all, delete-orphan")
    ai_catalogs = relationship("AICatalog", back_populates="artwork", cascade="all, delete-orphan")
    ai_price_predictions = relationship("AIPricePrediction", back_populates="artwork", cascade="all, delete-orphan")
    b2b_matches = relationship("B2BMatch", back_populates="artwork", cascade="all, delete-orphan")


class ArtworkImage(Base):
    __tablename__ = "artwork_images"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    artwork_id = Column(UUIDType, ForeignKey("artworks.id"), nullable=False)
    url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    alt_text = Column(String(255), nullable=True)
    is_primary = Column(Boolean, default=False, nullable=False)
    is_enhanced = Column(Boolean, default=False, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    artwork = relationship("Artwork", back_populates="images")


class ArtworkAttribute(Base):
    __tablename__ = "artwork_attributes"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    artwork_id = Column(UUIDType, ForeignKey("artworks.id"), nullable=False)
    attribute_name = Column(String(100), nullable=False)
    attribute_value = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    artwork = relationship("Artwork", back_populates="attributes")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    parent = relationship("Category", remote_side=[id])
    artworks = relationship("Artwork", back_populates="category")
