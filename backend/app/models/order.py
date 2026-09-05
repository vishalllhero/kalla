import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, Integer, Numeric, JSON
from sqlalchemy.orm import relationship
from .base import UUIDType, Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    buyer_id = Column(UUIDType, ForeignKey("users.id"), nullable=False)
    artisan_id = Column(UUIDType, ForeignKey("users.id"), nullable=False)
    status = Column(String(30), default="pending", nullable=False)
    total_amount = Column(Integer, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    platform_fee = Column(Integer, default=0, nullable=False)
    artisan_payout = Column(Integer, default=0, nullable=False)
    payment_status = Column(String(20), default="pending", nullable=False)
    payment_method = Column(String(50), nullable=True)
    shipping_status = Column(String(30), default="not_shipped", nullable=False)
    shipping_address = Column(JSON, nullable=True)
    tracking_number = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    is_b2b = Column(Boolean, default=False, nullable=False)
    is_negotiable_offer = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    buyer = relationship("User", foreign_keys=[buyer_id])
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
    platform_fees = relationship("PlatformFee", back_populates="order", cascade="all, delete-orphan")
    artisan_payouts = relationship("ArtisanPayout", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    order_id = Column(UUIDType, ForeignKey("orders.id"), nullable=False)
    artwork_id = Column(UUIDType, ForeignKey("artworks.id"), nullable=False)
    price = Column(Integer, nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    platform_fee_amount = Column(Integer, default=0, nullable=False)
    artisan_payout_amount = Column(Integer, default=0, nullable=False)
    status = Column(String(30), default="pending", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="order_items")
    artwork = relationship("Artwork", back_populates="order_items")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    order_id = Column(UUIDType, ForeignKey("orders.id"), nullable=False)
    transaction_id = Column(String(100), unique=True, index=True, nullable=False)
    amount = Column(Integer, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    payment_method = Column(String(50), nullable=False)
    payment_status = Column(String(20), default="pending", nullable=False)
    gateway_response = Column(JSON, nullable=True)
    fee_amount = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    order = relationship("Order", back_populates="payments")


class PlatformFee(Base):
    __tablename__ = "platform_fees"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    order_id = Column(UUIDType, ForeignKey("orders.id"), nullable=True)
    amount = Column(Integer, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    percentage = Column(Numeric(precision=5, scale=2), nullable=False)
    fee_type = Column(String(50), default="primary_sale", nullable=False)
    description = Column(String(500), nullable=True)
    transaction_date = Column(DateTime, default=datetime.utcnow)
    recorded = Column(Boolean, default=True, nullable=False)

    order = relationship("Order", back_populates="platform_fees")


class ArtisanPayout(Base):
    __tablename__ = "artisan_payouts"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    order_id = Column(UUIDType, ForeignKey("orders.id"), nullable=True)
    artisan_id = Column(UUIDType, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    order_total = Column(Integer, nullable=False)
    platform_fee = Column(Integer, default=0, nullable=False)
    net_payout = Column(Integer, nullable=False)
    payment_status = Column(String(20), default="pending", nullable=False)
    transaction_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, default=datetime.utcnow)

    artisan = relationship("User")
    order = relationship("Order", back_populates="artisan_payouts")


class Offer(Base):
    __tablename__ = "offers"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    artwork_id = Column(UUIDType, ForeignKey("artworks.id"), nullable=False)
    buyer_id = Column(UUIDType, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    message = Column(Text, nullable=True)
    status = Column(String(20), default="pending", nullable=False)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    responded_at = Column(DateTime, nullable=True)

    artwork = relationship("Artwork", back_populates="offers")
    buyer = relationship("User", foreign_keys=[buyer_id])


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(UUIDType, primary_key=True, index=True, default=uuid.uuid4)
    user_id = Column(UUIDType, ForeignKey("users.id"), nullable=False)
    artwork_id = Column(UUIDType, ForeignKey("artworks.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="wishlist_items")
    artwork = relationship("Artwork")
