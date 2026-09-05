import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from .base import UUIDType
from ..core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_2fa_enabled = Column(Boolean, default=False, nullable=False)
    full_name = Column(String(255), nullable=True)
    display_name = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    preferred_language = Column(String(10), default="en", nullable=False)
    country_code = Column(String(2), default="IN", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)

    role = relationship("Role", backref="users")
    artisan_profile = relationship("ArtisanProfile", uselist=False, back_populates="user", cascade="all, delete-orphan")
    buyer_profile = relationship("BuyerProfile", uselist=False, back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="recipient", cascade="all, delete-orphan")
    reports = relationship("Report", foreign_keys="Report.reporter_id", back_populates="reporter")


class ArtisanProfile(Base):
    __tablename__ = "artisan_profiles"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    user_id = Column(UUIDType, ForeignKey("users.id"), nullable=False, unique=True)
    artisan_id = Column(String(50), unique=True, index=True, nullable=False)
    bio = Column(Text, nullable=True)
    craft_experience_years = Column(Integer, default=0)
    workshop_location = Column(String(255), nullable=True)
    artisan_name = Column(String(255), nullable=True)
    region = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_status = Column(String(20), default="pending", nullable=False)
    verification_notes = Column(Text, nullable=True)
    verification_date = Column(DateTime, nullable=True)
    badge_level = Column(String(20), default="bronze", nullable=False)
    total_sales = Column(Integer, default=0, nullable=False)
    total_listings = Column(Integer, default=0, nullable=False)
    avg_rating = Column(String(10), default="0.0", nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    instagram_handle = Column(String(100), nullable=True)
    website_url = Column(String(500), nullable=True)
    id_proof_type = Column(String(50), nullable=True)
    id_proof_url = Column(String(500), nullable=True)
    is_approved_to_sell = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="artisan_profile")


class BuyerProfile(Base):
    __tablename__ = "buyer_profiles"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    user_id = Column(UUIDType, ForeignKey("users.id"), nullable=False, unique=True)
    full_name = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(20), nullable=True)
    country = Column(String(100), default="India", nullable=True)
    is_business = Column(Boolean, default=False, nullable=False)
    company_name = Column(String(255), nullable=True)
    gst_number = Column(String(50), nullable=True)
    preferred_currency = Column(String(10), default="INR", nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="buyer_profile")


class AdminProfile(Base):
    __tablename__ = "admin_profiles"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    user_id = Column(UUIDType, ForeignKey("users.id"), nullable=False, unique=True)
    admin_level = Column(String(20), default="super", nullable=False)
    can_manage_users = Column(Boolean, default=True, nullable=False)
    can_verify_artisans = Column(Boolean, default=True, nullable=False)
    can_verify_artworks = Column(Boolean, default=True, nullable=False)
    can_manage_categories = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="admin_profile")
